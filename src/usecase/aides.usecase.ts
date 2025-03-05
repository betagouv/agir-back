import { Injectable } from '@nestjs/common';

import {
  AideFilter,
  AideRepository,
} from '../../src/infrastructure/repository/aide.repository';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Aide } from '../domain/aides/aide';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { App } from '../domain/app';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { AideExpirationWarningRepository } from '../infrastructure/repository/aideExpirationWarning.repository';

@Injectable()
export class AidesUsecase {
  constructor(
    private aideExpirationWarningRepository: AideExpirationWarningRepository,
    private emailSender: EmailSender,
    private aideRepository: AideRepository,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getCatalogueAidesUtilisateur(
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

    const aide_def_liste = await this.aideRepository.search({
      code_postal: utilisateur.logement.code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
      date_expiration: new Date(),
    });

    const aides_nationales: Aide[] = [];
    const aides_locales: Aide[] = [];
    for (const aide_def of aide_def_liste) {
      if (aide_def.echelle === Echelle.National) {
        aides_nationales.push(this.setHistoryData(aide_def, utilisateur));
      } else {
        aides_locales.push(this.setHistoryData(aide_def, utilisateur));
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

  async getAideUniqueByIdCMS(cms_id: string): Promise<AideDefinition> {
    const aide = await this.aideRepository.getByContentId(cms_id);

    if (!aide) {
      ApplicationError.throwAideNotFound(cms_id);
    }

    return this.personnalisator.personnaliser(aide);
  }

  async getAideUniqueUtilisateurByIdCMS(
    utilisateurId: string,
    cms_id: string,
  ): Promise<Aide> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_def = await this.aideRepository.getByContentId(cms_id);

    if (!aide_def) {
      ApplicationError.throwAideNotFound(cms_id);
    }

    const aide = this.setHistoryData(aide_def, utilisateur);

    utilisateur.history.consulterAide(cms_id);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );

    return this.personnalisator.personnaliser(aide);
  }

  async consulterAide(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.consulterAide(id_cms);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.history_article_quizz_aides],
    );
  }
  async deroulerAide(utilisateurId: string, id_cms: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const aide_exist = await this.aideRepository.exists(id_cms);
    if (!aide_exist) {
      ApplicationError.throwAideNotFound(id_cms);
    }

    utilisateur.history.deroulerAide(id_cms);

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

    const aide_exist = await this.aideRepository.exists(id_cms);
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

    const aide_exist = await this.aideRepository.exists(id_cms);
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

  private setHistoryData(
    aide_def: AideDefinition,
    utilisateur: Utilisateur,
  ): Aide {
    const aide = new Aide(aide_def);
    const aide_hist = utilisateur.history.getAideInteractionByIdCms(
      aide_def.content_id,
    );
    if (aide_hist) {
      aide.clicked_demande = aide_hist.clicked_demande;
      aide.clicked_infos = aide_hist.clicked_infos;
      aide.vue_at = aide_hist.vue_at;
    }
    return aide;
  }
}
