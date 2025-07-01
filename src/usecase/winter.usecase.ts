import { Injectable } from '@nestjs/common';
import { TypeAction } from '../domain/actions/typeAction';
import {
  ConsommationElectrique,
  TypeUsage,
} from '../domain/linky/consommationElectrique';
import { LinkyConsent } from '../domain/linky/linkyConsent';
import { RecommandationWinter } from '../domain/thematique/history/thematiqueHistory';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { LinkyConsentRepository } from '../infrastructure/repository/linkyConsent.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterRepository } from '../infrastructure/repository/winter/winter.repository';

const PRM_REGEXP = new RegExp('^[0123456789]{14}$');
const TROIS_ANS = 1000 * 60 * 60 * 24 * 365 * 3;

const mention_v1 = `En activant le suivi,
je déclare sur l'honneur être titulaire du compteur électrique ou être mandaté par celui-ci.
J'autorise J'Agis et son partenaire Watt Watchers à recueillir mon historique de consommation d'électricité sur 3 ans (demi-heure, journée et puissance maximum quotidienne),
ainsi qu'à analyser mes consommations tant que j'ai un compte`;

const CURRENT_VERSION = 'v1';

@Injectable()
export class WinterUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private winterRepository: WinterRepository,
    private linkyConsentRepository: LinkyConsentRepository,
  ) {}

  public async inscrireAdresse(
    utilisateurId: string,
    nom: string,
    adresse: string,
    code_postal: string,
    code_commune: string,
    ip: string,
    user_agent: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (!nom) {
      ApplicationError.throwNomObligatoireError();
    }
    if (!code_postal || !code_commune) {
      ApplicationError.throwCodePostalCommuneMandatory();
    }
    if (!adresse) {
      ApplicationError.throwUserMissingAdresseForPrmSearch();
    }
    const target_prm = await this.winterRepository.rechercherPRMParAdresse(
      nom,
      adresse,
      code_commune,
      code_postal,
    );

    await this.connect_prm(utilisateur, nom, target_prm, ip, user_agent);
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

    await this.connect_prm(utilisateur, nom, prm, ip, user_agent);
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

  public async refreshListeActions(
    utilisateurId: string,
  ): Promise<RecommandationWinter[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = await this.external_update_winter_recommandation(
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );

    return result;
  }

  public async getUsage(
    utilisateurId: string,
  ): Promise<ConsommationElectrique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.core, Scope.logement, Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    if (!utilisateur.logement.prm) {
      ApplicationError.throwMissingPRMSouscription();
    }

    const usage = await this.winterRepository.getUsage(utilisateurId);

    const result = new ConsommationElectrique({
      computingFinished: usage.computingFinished,
      consommation_totale_euros:
        usage.yearlyElectricityTotalConsumption[0].value,
      monthsOfDataAvailable: usage.monthsOfDataAvailable,
      detail_usages: [],
      nombre_actions_associees:
        utilisateur.thematique_history.getNombreActionsWinter(),
      economies_realisees_euros:
        utilisateur.thematique_history.calculeEconomiesWinterRealisées(),
    });

    for (const [key, value] of Object.entries(usage.usageBreakdown)) {
      if (TypeUsage[key]) {
        const typed_value = value as {
          kWh: number;
          eur: number;
          percent: number;
        };
        result.detail_usages.push({
          type: TypeUsage[key],
          eur: typed_value.eur,
          kWh: typed_value.kWh,
          percent: typed_value.percent,
        });
      }
    }

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
      new_reco_set.push({
        action: {
          code: winter_action.slug,
          type: TypeAction.classique,
        },
        montant_economies_euro: winter_action.economy,
      });
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
  ): Promise<void> {
    await this.winterRepository.inscrirePRM(
      prm,
      nom,
      utilisateur.id,
      ip,
      user_agent,
      CURRENT_VERSION,
    );

    utilisateur.logement.prm = prm;

    const consent = this.buildConsentement(
      utilisateur.email,
      nom,
      prm,
      utilisateur.id,
      ip,
      user_agent,
    );

    await this.linkyConsentRepository.insert(consent);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.logement],
    );
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
}
