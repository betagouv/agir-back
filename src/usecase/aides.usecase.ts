import { Injectable } from '@nestjs/common';

import {
  AideFilter,
  AideRepository,
} from '../../src/infrastructure/repository/aide.repository';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Aide } from '../domain/aides/aide';
import { AideFeedback } from '../domain/aides/aideFeedback';
import { Echelle } from '../domain/aides/echelle';
import { App } from '../domain/app';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { AideExpirationWarningRepository } from '../infrastructure/repository/aideExpirationWarning.repository';
import { PartenaireRepository } from '../infrastructure/repository/partenaire.repository';

const MAX_FEEDBACK_LENGTH = 500;

const BAD_CHAR_LISTE = `^#&*<>/{|}$%@+`;
const BAD_CHAR_REGEXP = new RegExp(`^[` + BAD_CHAR_LISTE + ']+$');

@Injectable()
export class AidesUsecase {
  constructor(
    private aideExpirationWarningRepository: AideExpirationWarningRepository,
    private emailSender: EmailSender,
    private aideRepository: AideRepository,
    private partenaireRepository: PartenaireRepository,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getCatalogueAidesUtilisateur(
    utilisateurId: string,
    filtre_thematiques: Thematique[],
  ): Promise<{ aides: Aide[]; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement, Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const code_commune = utilisateur.logement.code_commune;

    const dept_region =
      this.communeRepository.findDepartementRegionByCodeCommune(code_commune);

    const filtre: AideFilter = {
      code_postal: utilisateur.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      date_expiration: new Date(),
      thematiques:
        filtre_thematiques.length > 0 ? filtre_thematiques : undefined,
      cu_ca_cc_mode: true,
      commune_pour_partenaire: utilisateur.logement.code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
    };

    const aide_def_liste = await this.aideRepository.search(filtre);

    const aides_nationales: Aide[] = [];
    const aides_locales: Aide[] = [];
    for (const aide_def of aide_def_liste) {
      if (aide_def.echelle === Echelle.National) {
        const aide = Aide.newAide(aide_def, utilisateur);
        this.setPartenaire(aide, code_commune);
        aides_nationales.push(aide);
      } else {
        const aide = Aide.newAide(aide_def, utilisateur);
        this.setPartenaire(aide, code_commune);
        aides_locales.push(aide);
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

  async getAideUniqueByIdCMS(cms_id: string): Promise<Aide> {
    const aide_def = this.aideRepository.getAide(cms_id);

    if (!aide_def) {
      ApplicationError.throwAideNotFound(cms_id);
    }

    const aide = new Aide(aide_def);
    this.setPartenaire(aide, null);

    return this.personnalisator.personnaliser(aide);
  }

  async getAideUniqueUtilisateurByIdCMS(
    utilisateurId: string,
    cms_id: string,
  ): Promise<Aide> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const aide_def = this.aideRepository.getAide(cms_id);

    if (!aide_def) {
      ApplicationError.throwAideNotFound(cms_id);
    }

    const aide = Aide.newAide(aide_def, utilisateur);

    this.setPartenaire(aide, utilisateur.logement.code_commune);

    utilisateur.history.consulterAide(cms_id);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );

    return this.personnalisator.personnaliser(aide);
  }

  async feedbackAide(
    utilisateurId: string,
    id_cms: string,
    feedback: AideFeedback,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = this.aideRepository.getAide(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    if (feedback.like_level) {
      if (![1, 2, 3, 4].includes(feedback.like_level)) {
        ApplicationError.throwBadLikeLevel(feedback.like_level);
      }
    }
    if (feedback.feedback) {
      if (feedback.feedback.length > 500) {
        ApplicationError.throwTooBigData(
          'feedback',
          feedback.feedback,
          MAX_FEEDBACK_LENGTH,
        );
      }
      if (!BAD_CHAR_REGEXP.test(feedback.feedback)) {
        ApplicationError.throwBadChar(BAD_CHAR_LISTE);
      }
    }

    if (
      feedback.est_connue_utilisateur !== null &&
      feedback.est_connue_utilisateur !== undefined
    ) {
      if ('boolean' !== typeof feedback.est_connue_utilisateur) {
        ApplicationError.throwNotBoolean(
          'est_connue_utilisateur',
          feedback.est_connue_utilisateur,
        );
      }
    }
    if (
      feedback.sera_sollicitee_utilisateur !== null &&
      feedback.sera_sollicitee_utilisateur !== undefined
    ) {
      if ('boolean' !== typeof feedback.sera_sollicitee_utilisateur) {
        ApplicationError.throwNotBoolean(
          'sera_sollicitee_utilisateur',
          feedback.sera_sollicitee_utilisateur,
        );
      }
    }

    utilisateur.history.feedbackAide(id_cms, feedback);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
  }

  async consulterAide(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = this.aideRepository.getAide(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.consulterAide(id_cms);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
  }

  async consulterAideInfosLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = this.aideRepository.getAide(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideInfosLink(id_cms);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
  }
  async consulterAideDemandeLink(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = this.aideRepository.getAide(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.clickAideDemandeLink(id_cms);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
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

  public async updatesAllAidesCommunes(block_size = 100) {
    await this.partenaireRepository.loadCache();

    const total_aide_count = await this.aideRepository.countAll();
    for (let index = 0; index < total_aide_count; index = index + block_size) {
      const current_aide_list = await this.aideRepository.listePaginated(
        index,
        block_size,
      );

      for (const aide of current_aide_list) {
        const computed =
          this.external_compute_communes_departement_regions_from_liste_partenaires(
            aide.partenaires_supp_ids,
          );

        await this.aideRepository.updateAideCodesFromPartenaire(
          aide.content_id,
          computed.codes_commune,
          computed.codes_departement,
          computed.codes_region,
        );
      }
    }
  }

  async external_count_aides(
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
      filtre.code_departement = dept_region?.code_departement;
      filtre.code_region = dept_region?.code_region;
    }

    filtre.date_expiration = new Date();
    if (thematique) {
      filtre.thematiques = [thematique];
    }

    return await this.aideRepository.count(filtre);
  }

  private setPartenaire(aide: Aide, code_commune: string) {
    const liste_part = PartenaireRepository.getPartenaires(
      aide.partenaires_supp_ids,
    );
    aide.setPartenairePourUtilisateur(code_commune, liste_part);
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
<br>Je te souhaite que cette journée finisse mieux qu'elle n'a commencé...`,
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

  public external_compute_codes_communes_from_liste_partenaires(
    part_ids: string[],
  ): string[] {
    if (!part_ids || part_ids.length === 0) {
      return [];
    }
    const result = new Set<string>();

    for (const partenare_id of part_ids) {
      const partenaire = PartenaireRepository.getPartenaire(partenare_id);
      if (partenaire.code_commune) {
        result.add(partenaire.code_commune);
      }
      if (partenaire.code_epci) {
        const liste_codes_communes = this.external_compute_communes_from_epci(
          partenaire.code_epci,
        );
        for (const commune of liste_codes_communes) {
          result.add(commune);
        }
      }
    }
    return Array.from(result);
  }

  public external_compute_communes_departement_regions_from_liste_partenaires(
    part_ids: string[],
  ): {
    codes_commune: string[];
    codes_region: string[];
    codes_departement: string[];
  } {
    const result = {
      codes_commune: [],
      codes_departement: [],
      codes_region: [],
    };
    if (!part_ids || part_ids.length === 0) {
      return result;
    }
    const all_codes_communes = new Set<string>();
    const codes_departement = new Set<string>();
    const codes_region = new Set<string>();

    for (const partenare_id of part_ids) {
      const partenaire = PartenaireRepository.getPartenaire(partenare_id);
      if (partenaire) {
        if (partenaire.code_commune) {
          all_codes_communes.add(partenaire.code_commune);
        }
        if (partenaire.code_epci) {
          const liste_codes_communes = this.external_compute_communes_from_epci(
            partenaire.code_epci,
          );
          for (const commune of liste_codes_communes) {
            all_codes_communes.add(commune);
          }
        }
        if (partenaire.code_departement) {
          codes_departement.add(partenaire.code_departement);
        }
        if (partenaire.code_region) {
          codes_region.add(partenaire.code_region);
        }
      }
    }

    result.codes_commune = Array.from(all_codes_communes);
    result.codes_departement = Array.from(codes_departement);
    result.codes_region = Array.from(codes_region);

    return result;
  }

  public external_compute_communes_from_epci(code_EPCI: string): string[] {
    if (!code_EPCI) {
      return [];
    }
    return this.communeRepository.getListeCodesCommuneParCodeEPCI(code_EPCI);
  }
}
