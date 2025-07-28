import { Injectable } from '@nestjs/common';
import {
  Consultation,
  Realisation,
  Recommandation,
} from '../domain/actions/catalogueAction';
import { TypeAction } from '../domain/actions/typeAction';
import { Selection } from '../domain/contenu/selection';
import {
  ConsommationElectrique,
  TypeUsage,
} from '../domain/linky/consommationElectrique';
import { LinkyConsent } from '../domain/linky/linkyConsent';
import { RecommandationWinter } from '../domain/thematique/history/thematiqueHistory';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ConnectPRMByAddressAPI } from '../infrastructure/api/types/winter/connectPRMByAddressAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { LinkyConsentRepository } from '../infrastructure/repository/linkyConsent.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterRepository } from '../infrastructure/repository/winter/winter.repository';
import { WinterUsageBreakdown } from '../infrastructure/repository/winter/winterAPIClient';
import { CatalogueActionUsecase } from './catalogue_actions.usecase';
import { LogementUsecase } from './logement.usecase';

const PRM_REGEXP = new RegExp('^[0123456789]{14}$');
const TROIS_ANS = 1000 * 60 * 60 * 24 * 365 * 3;

const mention_v1 = `En activant le suivi,
je déclare sur l'honneur être titulaire du compteur électrique ou être mandaté par celui-ci.
J'autorise J'Agis et son partenaire Watt Watchers à recueillir mon historique de consommation d'électricité sur 3 ans (demi-heure, journée et puissance maximum quotidienne),
ainsi qu'à analyser mes consommations tant que j'ai un compte`;

const CURRENT_VERSION = 'v1';

const WINTER_PARTENAIRE_CMS_ID = '455';

const USAGE_EMOJI: Record<TypeUsage, string> = {
  airConditioning: '❄️',
  appliances: '🧺',
  cooking: '🍳',
  heating: '🔥',
  hotWater: '🛁',
  lighting: '💡',
  mobility: '🚙',
  multimedia: '📺',
  other: '✳️',
  swimmingPool: '🏊',
};

const USAGE_COLORS: Record<TypeUsage, string> = {
  airConditioning: '007592',
  appliances: 'AEF372',
  cooking: 'A8C6E5',
  heating: 'FF9239',
  hotWater: '98CCFF',
  lighting: 'FFC739',
  mobility: 'CB9F75',
  multimedia: 'C1BEFF',
  other: '77F2B2',
  swimmingPool: '5574F2',
};

@Injectable()
export class WinterUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private winterRepository: WinterRepository,
    private actionRepository: ActionRepository,
    private logementUsecase: LogementUsecase,
    private linkyConsentRepository: LinkyConsentRepository,
    private catalogueActionUsecase: CatalogueActionUsecase,
  ) {}

  public async inscrireAdresse(
    utilisateurId: string,
    input: ConnectPRMByAddressAPI,
    ip: string,
    user_agent: string,
  ): Promise<void> {
    if (!input.nom) {
      ApplicationError.throwNomObligatoireError();
    }
    if (!input.code_postal || !input.code_commune) {
      ApplicationError.throwCodePostalCommuneMandatory();
    }
    if (!input.numero_rue || !input.rue) {
      ApplicationError.throwUserMissingAdresseForPrmSearch();
    }

    await this.logementUsecase.updateUtilisateurLogement(utilisateurId, {
      rue: input.rue,
      code_commune: input.code_commune,
      code_postal: input.code_postal,
      latitude: input.latitude,
      longitude: input.longitude,
      numero_rue: input.numero_rue,
    });

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );

    const target_prm = await this.winterRepository.rechercherPRMParAdresse(
      input.nom,
      utilisateur.logement.getAdresse(),
      utilisateur.logement.code_commune,
      utilisateur.logement.code_postal,
    );

    await this.connect_prm(
      utilisateur,
      input.nom,
      target_prm,
      ip,
      user_agent,
      true,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  public async inscrirePRM(
    utilisateurId: string,
    nom: string,
    prm: string,
    ip: string,
    user_agent: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (!prm) {
      ApplicationError.throwMissingPRM();
    }

    if (!PRM_REGEXP.test(prm)) {
      ApplicationError.throwBadPRM(prm);
    }

    await this.connect_prm(utilisateur, nom, prm, ip, user_agent, false);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  public async supprimerPRM(utilisateurId: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (!utilisateur.logement.prm) {
      return;
    }

    await this.winterRepository.supprimerPRM(utilisateurId);

    utilisateur.logement.prm = undefined;

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement],
    );
  }

  public async getUsage(
    utilisateurId: string,
  ): Promise<ConsommationElectrique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.thematique_history, Scope.recommandation],
    );
    Utilisateur.checkState(utilisateur);

    if (!utilisateur.logement.prm) {
      ApplicationError.throwMissingPRMSouscription();
    }

    const usage = await this.winterRepository.getUsage(utilisateurId);

    const catalogue_actions_winter_reco =
      await this.catalogueActionUsecase.external_get_utilisateur_catalogue(
        utilisateur,
        [],
        [Selection.actions_watt_watchers],
        undefined,
        Consultation.tout,
        Realisation.pas_faite,
        Recommandation.recommandee,
        undefined,
        false,
      );

    const result = new ConsommationElectrique({
      computingFinished: usage.computingFinished,
      consommation_totale_euros: this.getConsoEuroAnnuelle(usage),
      consommation_totale_kwh: this.getConsoKwhAnnuelle(usage),
      monthsOfDataAvailable: usage.monthsOfDataAvailable,
      detail_usages: [],
      nombre_actions_associees:
        catalogue_actions_winter_reco.nombre_resultats_disponibles,
      economies_realisees_euros:
        utilisateur.thematique_history.calculeEconomiesWinterRealisées(),
    });

    if (usage.usageBreakdown) {
      for (const [key, value] of Object.entries(usage.usageBreakdown)) {
        const type = TypeUsage[key];
        if (type) {
          const typed_value = value as {
            kWh: number;
            eur: number;
            percent: number;
          };
          result.detail_usages.push({
            type: type,
            eur: typed_value.eur,
            kWh: typed_value.kWh,
            percent: typed_value.percent,
            couleur: this.getTypeUsageCouleur(type),
            emoji: this.getTypeUsageEmoji(type),
          });
        }
      }
    }

    result.detail_usages.sort((a, b) => b.eur - a.eur);

    return result;
  }

  public async external_update_winter_recommandation(
    utilisateur: Utilisateur,
  ): Promise<RecommandationWinter[]> {
    if (!utilisateur.logement?.prm) {
      return [];
    }

    const new_reco_set: RecommandationWinter[] = [];

    const liste = await this.winterRepository.listerActionsWinter(
      utilisateur.id,
    );

    for (const winter_action of liste) {
      const winter_action_def =
        this.actionRepository.getActionPartenaireByExternalId(
          WINTER_PARTENAIRE_CMS_ID,
          winter_action.slug,
        );
      if (winter_action_def) {
        new_reco_set.push({
          action: {
            code: winter_action_def.code,
            type: TypeAction.classique,
          },
          montant_economies_euro: winter_action.economy,
        });
      }
    }

    utilisateur.thematique_history.setWinterRecommandations(new_reco_set);

    return new_reco_set;
  }

  public async external_synchroniser_data_logement(
    utilisateur: Utilisateur,
  ): Promise<void> {
    await this.winterRepository.putHousingData(utilisateur);
  }

  private async connect_prm(
    utilisateur: Utilisateur,
    nom: string,
    prm: string,
    ip: string,
    user_agent: string,
    par_adresse: boolean,
  ): Promise<void> {
    if (utilisateur.logement.prm) {
      await this.winterRepository.supprimerPRM(utilisateur.id);
      utilisateur.logement.prm = undefined;
      utilisateur.logement.est_prm_obsolete = false;
      utilisateur.logement.est_prm_par_adresse = false;
    }
    await this.winterRepository.inscrirePRM(
      prm,
      nom,
      utilisateur.id,
      ip,
      user_agent,
      CURRENT_VERSION,
    );

    utilisateur.logement.prm = prm;
    utilisateur.logement.est_prm_par_adresse = par_adresse;

    const consent = this.buildConsentement(
      utilisateur.email,
      nom,
      prm,
      utilisateur.id,
      ip,
      user_agent,
    );

    await this.linkyConsentRepository.insert(consent);
  }

  private buildConsentement(
    email: string,
    nom: string,
    prm: string,
    utilisateurId: string,
    ip: string,
    user_agent: string,
  ): LinkyConsent {
    return {
      date_consentement: new Date(),
      date_fin_consentement: new Date(Date.now() + TROIS_ANS),
      email: email,
      texte_signature: mention_v1,
      nom: nom,
      prm: prm,
      utilisateurId: utilisateurId,
      ip_address: ip,
      user_agent: user_agent,
    };
  }

  private getTypeUsageEmoji(type: TypeUsage): string {
    return USAGE_EMOJI[type];
  }
  private getTypeUsageCouleur(type: TypeUsage): string {
    return USAGE_COLORS[type];
  }

  public getConsoEuroAnnuelle(usage: WinterUsageBreakdown): number {
    const entry = usage.yearlyElectricityTotalConsumption.find(
      (a) => a.unit === '€',
    );
    return entry?.value;
  }
  public getConsoKwhAnnuelle(usage: WinterUsageBreakdown): number {
    const entry = usage.yearlyElectricityTotalConsumption.find(
      (a) => a.unit === 'kWh',
    );
    return entry?.value;
  }
}
