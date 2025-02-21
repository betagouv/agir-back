import { Injectable } from '@nestjs/common';

import { AidesVeloRepository } from '../infrastructure/repository/aidesVelo.repository';

import { AidesRetrofitRepository } from '../infrastructure/repository/aidesRetrofit.repository';

import {
  AidesVeloParType,
  AideVelo,
  AideVeloNonCalculee,
} from '../domain/aides/aideVelo';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  AideFilter,
  AideRepository,
} from '../../src/infrastructure/repository/aide.repository';
import { AideDefinition } from '../domain/aides/aideDefinition';
import {
  Commune,
  CommuneRepository,
  EPCI,
} from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { AideExpirationWarningRepository } from '../infrastructure/repository/aideExpirationWarning.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import { App } from '../domain/app';
import { EchelleAide } from '../domain/aides/echelle';
import { Thematique } from '../domain/thematique/thematique';

@Injectable()
export class AidesUsecase {
  constructor(
    private aidesVeloRepository: AidesVeloRepository,
    private aideExpirationWarningRepository: AideExpirationWarningRepository,
    private aidesRetrofitRepository: AidesRetrofitRepository,
    private emailSender: EmailSender,
    private aideRepository: AideRepository,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private personnalisator: Personnalisator,
  ) {}
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideVelo[]> {
    return this.aidesRetrofitRepository.get(
      codePostal,
      revenuFiscalDeReference,
    );
  }

  async exportAides(): Promise<AideDefinition[]> {
    const liste = await this.aideRepository.listAll();
    for (const aide of liste) {
      const metropoles = new Set<string>();
      const cas = new Set<string>();
      const cus = new Set<string>();
      const ccs = new Set<string>();
      for (const code_postal of aide.codes_postaux) {
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'METRO')
          .map((m) => metropoles.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CA')
          .map((m) => cas.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CC')
          .map((m) => ccs.add(m));
        this.communeRepository
          .findRaisonSocialeDeNatureJuridiqueByCodePostal(code_postal, 'CU')
          .map((m) => cus.add(m));
      }
      aide.ca = Array.from(cas.values());
      aide.cc = Array.from(ccs.values());
      aide.cu = Array.from(cus.values());
      aide.metropoles = Array.from(metropoles.values());
    }
    liste.sort((a, b) => parseInt(a.content_id) - parseInt(b.content_id));
    return liste;
  }

  async clickAideInfosLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideInfosLink(id_cms);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
  async clickAideDemandeLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideDemandeLink(id_cms);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getCatalogueAides(
    utilisateurId: string,
  ): Promise<{ aides: AideDefinition[]; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const code_commune = this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );

    const dept_region =
      this.communeRepository.findDepartementRegionByCodePostal(
        utilisateur.logement.code_postal,
      );

    const result = await this.aideRepository.search({
      code_postal: utilisateur.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
      date_expiration: new Date(),
    });

    for (const aide of result) {
      const aide_hist = utilisateur.history.getAideInteractionByIdCms(
        aide.content_id,
      );
      if (aide_hist) {
        aide.clicked_demande = aide_hist.clicked_demande;
        aide.clicked_infos = aide_hist.clicked_infos;
      }
    }

    const aides_nationales = [];
    const aides_locales = [];
    for (const aide_def of result) {
      if (aide_def.echelle === EchelleAide.National) {
        aides_nationales.push(aide_def);
      } else {
        aides_locales.push(aide_def);
      }
    }

    return {
      aides: this.personnalisator.personnaliser(
        aides_nationales.concat(aides_locales),
        utilisateur,
      ),
      utilisateur: utilisateur,
    };
  }

  async simulerAideVelo(
    utilisateurId: string,
    prix_velo: number,
    etat_velo: 'neuf' | 'occasion' = 'neuf',
  ): Promise<AidesVeloParType> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const RFR =
      utilisateur.revenu_fiscal === null ? 0 : utilisateur.revenu_fiscal;
    const PARTS = utilisateur.getNombrePartsFiscalesOuEstimee();
    const ABONNEMENT =
      utilisateur.abonnement_ter_loire === null
        ? false
        : utilisateur.abonnement_ter_loire;

    const code_insee = this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );
    const commune = this.communeRepository.getCommuneByCodeINSEE(code_insee);
    const epci = this.communeRepository.getEPCIByCommuneCodeINSEE(code_insee);

    return this.aidesVeloRepository.getSummaryVelos({
      'localisation . code insee': code_insee,
      'localisation . epci': epci?.nom,
      'localisation . région': commune?.region,
      'localisation . département': commune?.departement,
      'vélo . prix': prix_velo,
      'aides . pays de la loire . abonné TER': ABONNEMENT,
      'foyer . personnes': utilisateur.getNombrePersonnesDansLogement(),
      'revenu fiscal de référence par part . revenu de référence': RFR,
      'revenu fiscal de référence par part . nombre de parts': PARTS,
      'vélo . état': etat_velo,
    });
  }

  async simulerAideVeloParCodeCommmuneOuEPCI(
    code_insee_commune_ou_EPCI: string,
    prix_velo: number,
    rfr: number,
    parts: number,
    etat_velo: 'neuf' | 'occasion' = 'neuf',
  ): Promise<AidesVeloParType> {
    let commune: Commune;
    let code_EPCI = undefined;
    let epci: EPCI = undefined;
    const IS_EPCI = this.communeRepository.isCodeSirenEPCI(
      code_insee_commune_ou_EPCI,
    );
    if (IS_EPCI) {
      code_EPCI = code_insee_commune_ou_EPCI;
      epci = this.communeRepository.getEPCIBySIRENCode(code_EPCI);
    } else {
      commune = this.communeRepository.getCommuneByCodeINSEE(
        code_insee_commune_ou_EPCI,
      );
    }
    const code_commune_de_EPCI = epci?.membres[0].code;
    const une_commune_EPCI =
      this.communeRepository.getCommuneByCodeINSEE(code_commune_de_EPCI);

    const region = commune?.region || une_commune_EPCI?.region;
    const departement = commune?.departement || une_commune_EPCI?.departement;

    // FIXME: Si on accepte le fait que les paramètres peuvent être null, alors
    // il faut le préciser dans l'API et il sera également préférable
    // d'utiliser les valeurs par défaut du modèle pour maximiser le montant
    // des aides.
    return this.aidesVeloRepository.getSummaryVelos({
      'localisation . code insee': IS_EPCI ? undefined : commune.code,
      'localisation . epci': epci?.nom,
      'localisation . région': region,
      'localisation . département': departement,
      'vélo . prix': prix_velo ? prix_velo : 1000,
      'aides . pays de la loire . abonné TER': false,
      'foyer . personnes': parts ? parts : 2,
      'revenu fiscal de référence par part . revenu de référence': rfr
        ? rfr
        : 40000,
      'revenu fiscal de référence par part . nombre de parts': parts,
      'vélo . état': etat_velo,
    });
  }

  /**
   * Récupère toutes les aides disponible pour une commune ou un EPCI donné.
   *
   * @param code - Le code INSEE de la commune ou le code SIREN de l'EPCI.
   * @returns La liste de toutes aides disponible pour la commune ou l'EPCI donné.
   *
   * @note Les aides ne sont pas calculées et peuvent donc ne pas être éligibles pour certaines personnes.
   */
  async recupererToutesLesAidesDisponiblesParCommuneOuEPCI(
    code: string,
  ): Promise<AideVeloNonCalculee[]> {
    const isEPCI = this.communeRepository.isCodeSirenEPCI(code);
    const commune: Commune | undefined = isEPCI
      ? undefined
      : this.communeRepository.getCommuneByCodeINSEE(code);
    const epci: EPCI | undefined = isEPCI
      ? this.communeRepository.getEPCIBySIRENCode(code)
      : this.communeRepository.getEPCIByCommuneCodeINSEE(code);

    const codeCommuneDeEPCI = epci?.membres[0].code;
    const communeDeEPCI =
      this.communeRepository.getCommuneByCodeINSEE(codeCommuneDeEPCI);
    const region = isEPCI ? communeDeEPCI?.region : commune?.region;
    const departement = isEPCI
      ? communeDeEPCI?.departement
      : commune?.departement;

    return this.aidesVeloRepository.getAllAidesIn({
      'localisation . pays': 'France',
      'localisation . code insee': isEPCI ? undefined : commune?.code,
      'localisation . epci': epci?.nom,
      'localisation . région': region,
      'localisation . département': departement,
    });
  }

  public async reportAideSoonExpired(): Promise<string[]> {
    const result = [];
    const liste_aide_all = await this.aideRepository.listAll();

    const day = 1000 * 60 * 60 * 24;
    const week = day * 7;
    const month = day * 30;

    const NOW = Date.now();

    for (const aide of liste_aide_all) {
      if (aide.date_expiration) {
        const month_warning = aide.date_expiration.getTime() - month < NOW;
        const week_warning = aide.date_expiration.getTime() - week < NOW;
        const expired = aide.date_expiration.getTime() < NOW;

        if (month_warning || week_warning || expired) {
          await this.aideExpirationWarningRepository.upsert({
            aide_cms_id: aide.content_id,
            last_month: month_warning,
            last_week: week_warning,
            expired: expired,
          });
          result.push(
            `SET : ${aide.content_id}:Month[${month_warning}]Week[${week_warning}]Expired[${expired}]`,
          );
        } else {
          await this.aideExpirationWarningRepository.delete(aide.content_id);
          result.push(`REMOVED : ${aide.content_id}`);
        }
      }
    }
    return result;
  }

  public async envoyerEmailsAideExpiration(): Promise<string[]> {
    const result: string[] = [];

    const liste_expirations =
      await this.aideExpirationWarningRepository.get_all();

    for (const aide_exp of liste_expirations) {
      if (aide_exp.last_month && !aide_exp.last_month_sent) {
        await this.sent_aide_expiration_emails('month', aide_exp.aide_cms_id);
        result.push(`month:${aide_exp.aide_cms_id}`);
      }
      if (aide_exp.last_week && !aide_exp.last_week_sent) {
        await this.sent_aide_expiration_emails('week', aide_exp.aide_cms_id);
        result.push(`week:${aide_exp.aide_cms_id}`);
      }
      if (aide_exp.expired && !aide_exp.expired_sent) {
        await this.sent_aide_expiration_emails('expired', aide_exp.aide_cms_id);
        result.push(`expired:${aide_exp.aide_cms_id}`);
      }
    }
    return result;
  }

  async internal_count_aides(
    thematique?: Thematique,
    code_commune?: string,
  ): Promise<number> {
    const filtre: AideFilter = {};

    if (code_commune) {
      const codes_postaux =
        this.communeRepository.getCodePostauxFromCodeCommune(code_commune);
      const dept_region =
        this.communeRepository.findDepartementRegionByCodeCommune(code_commune);

      filtre.code_postal = codes_postaux[0];
      filtre.code_commune = code_commune;
      filtre.code_departement = dept_region.code_departement;
      filtre.code_region = dept_region.code_region;
    }

    filtre.date_expiration = new Date();
    if (thematique) {
      filtre.thematiques = [thematique];
    }

    return await this.aideRepository.count(filtre);
  }

  private async sent_aide_expiration_emails(
    type: 'month' | 'week' | 'expired',
    id: string,
  ) {
    const liste_emails = App.listEmailsWarningAideExpiration();
    for (const email of liste_emails) {
      if (type === 'month') {
        const sent_email = await this.emailSender.sendEmail(
          email,
          'Admin',
          `Bonjour oh toi grande prêtresse des Z !
<br>
<br>Sache que j'ai trouvé l'aide <a href="${App.getCmsAidePreviewURL()}/${id}">numéro ${id}</a> qui va expirer dans moins de 1 mois 🧐
<br>
<br>je pense que cela peut t'intéresser
<br>
<br>Je te souhaite une bien bonne journée`,
          `L'aide d'id ${id} va expirer dans 1 mois`,
        );
        if (sent_email) {
          await this.aideExpirationWarningRepository.upsert({
            aide_cms_id: id,
            last_month_sent: true,
          });
        }
      }
      if (type === 'week') {
        const sent_email = await this.emailSender.sendEmail(
          email,
          'Admin',
          `Bonjour oh toi grande prêtresse des Z !
<br>
<br>Je veux pas te stresser plus que cela, mais l'aide <a href="${App.getCmsAidePreviewURL()}/${id}">numéro ${id}</a> va expirer dans moins de 1 semaine 😱
<br>
<br>je pense qu'il est VRAIMENT temps de faire quelque chose...
<br>
<br>Je te souhaite néanmoins une bien bonne journée`,
          `L'aide d'id ${id} va expirer dans 1 semaine`,
        );
        if (sent_email) {
          await this.aideExpirationWarningRepository.upsert({
            aide_cms_id: id,
            last_week_sent: true,
          });
        }
      }
      if (type === 'expired') {
        const sent_email = await this.emailSender.sendEmail(
          email,
          'Admin',
          `Bonjour oh toi grande prêtresse des Z !
<br>
<br>Je ne sais pas si c'est voulu, mais l'aide <a href="${App.getCmsAidePreviewURL()}/${id}">numéro ${id}</a> est belle et bien <strong>expirée</strong> 😭, par mesure de précaution j'ai décidé de ne plus la rendre visible sur le service jusqu'à nouvel ordre.
<br>
<br>Je ne veux pas juger, mais son altesse a quand même un peu échoué dans sa mission de maintenir l'ordre dans le royaume....
<br>
<br>Je te souhaite une bien bonne journée, bien qu'elle commence un peu mal à mon goût.`,
          `L'aide d'id ${id} est expirée et supprimée du catalogue utilisateur`,
        );
        if (sent_email) {
          await this.aideExpirationWarningRepository.upsert({
            aide_cms_id: id,
            expired_sent: true,
          });
        }
      }
    }
  }
}
