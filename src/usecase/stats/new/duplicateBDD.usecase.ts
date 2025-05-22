import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Action } from '../../../domain/actions/action';
import { Aide } from '../../../domain/aides/aide';
import { Article } from '../../../domain/contenu/article';
import { Quizz } from '../../../domain/contenu/quizz';
import { Scope, Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { NGCCalculator } from '../../../infrastructure/ngc/NGCCalculator';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { AideRepository } from '../../../infrastructure/repository/aide.repository';
import { ArticleRepository } from '../../../infrastructure/repository/article.repository';
import { QuizzRepository } from '../../../infrastructure/repository/quizz.repository';
import { StatistiqueExternalRepository } from '../../../infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from '../../bilanCarbone.usecase';

const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;
const MAX_USER_TO_COMPUTE_BILAN_CARBONE = 3000;

@Injectable()
export class DuplicateBDDForStatsUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueExternalRepository: StatistiqueExternalRepository,
    private actionRepository: ActionRepository,
    private articleRepository: ArticleRepository,
    private aideRepository: AideRepository,
    private quizzRepository: QuizzRepository,
    private bilanCarboneUsecase: BilanCarboneUsecase,
    private nGCCalculator: NGCCalculator,
  ) {}

  async duplicateUtilisateur(block_size: number = 100) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllUserData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.logement, Scope.gamification, Scope.notification_history],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);
        try {
          await this.statistiqueExternalRepository.createUserData(user);
        } catch (error) {
          console.error(error);
          console.error(`Error Creating User : ${JSON.stringify(user)}`);
        }
      }
    }
  }

  async duplicateUtilisateurNotifications(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllUserNotifData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.notification_history],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        for (const notif of user.notification_history.sent_notifications) {
          let data;
          try {
            data = {
              user_ext_id: user.external_stat_id,
              type: notif.type,
              canal: notif.canal,
              date: notif.date_envoie,
            };
            await this.statistiqueExternalRepository.createUserNotificationData(
              data,
            );
          } catch (error) {
            console.error(error);
            console.error(`Error Creating Notif : ${JSON.stringify(data)}`);
          }
        }
      }
    }
  }
  async duplicateUtilisateurVistes(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllUserVisiteData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.core],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const activity_log = await this.utilisateurRepository.getActivityLog(
          user.id,
        );

        for (const date of activity_log) {
          try {
            await this.statistiqueExternalRepository.createUserVisiteData(
              user.external_stat_id,
              date,
            );
          } catch (error) {
            console.error(error);
            console.error(`Error Creating Visite at date [${date}]`);
          }
        }
      }
    }
  }

  async duplicateQuestionsUtilisateur(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllQuestionData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.thematique_history],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_questions = user.thematique_history.getAllQuestions();
        for (const question of liste_questions) {
          const action_def =
            this.actionRepository.getActionDefinitionByTypeCode(
              question.action,
            );

          const data = {
            action_cms_id: action_def.cms_id,
            action_faite: question.question.est_action_faite,
            action_titre: action_def.titre,
            date: question.question.date,
            question: question.question.question,
          };
          try {
            await this.statistiqueExternalRepository.createUserQuestionData(
              data.action_cms_id,
              data.action_titre,
              data.date,
              data.action_faite,
              data.question,
              user.external_stat_id,
            );
          } catch (error) {
            console.error(error);
            console.error(
              `Error Creating User Question : ${JSON.stringify(data)}`,
            );
          }
        }
      }
    }
  }

  async duplicateKYC(block_size: number = 100) {
    const total_user_count = await this.utilisateurRepository.countAll();

    const start_date = new Date(Date.now() - TWO_DAYS_MS);

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.kyc],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_kyc = user.kyc_history.getAnsweredKYCsAfter(start_date);
        for (const kyc of liste_kyc) {
          try {
            await this.statistiqueExternalRepository.upsertKYCData(
              user.external_stat_id,
              kyc,
            );
          } catch (error) {
            console.error(error);
            console.error(`Error Creating KYC : ${JSON.stringify(kyc)}`);
          }
        }
      }
    }
  }

  async duplicateAction(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllActionData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.thematique_history],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_actions =
          user.thematique_history.getListeActionsUtilisateur();

        for (const action_utilisateur of liste_actions) {
          const action_def =
            this.actionRepository.getActionDefinitionByTypeCode(
              action_utilisateur.action,
            );

          if (!action_def) {
            continue;
          }

          const final_action = Action.newAction(action_def, action_utilisateur);

          try {
            await this.statistiqueExternalRepository.createActionData(
              user.external_stat_id,
              final_action,
            );
          } catch (error) {
            console.error(error);
            console.error(
              `Error Creating Action : ${JSON.stringify(final_action)}`,
            );
          }
        }
      }
    }
  }

  async duplicateArticle(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllArticleData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.history_article_quizz_aides],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_articles = user.history.article_interactions;

        for (const article_utilisateur of liste_articles) {
          const article_def = this.articleRepository.getArticle(
            article_utilisateur.content_id,
          );
          if (!article_def) {
            continue;
          }

          const final_article = new Article(article_def);
          final_article.setHistory(article_utilisateur);

          try {
            await this.statistiqueExternalRepository.createArticleData(
              user.external_stat_id,
              final_article,
            );
          } catch (error) {
            console.error(error);
            console.error(
              `Error Creating Article : ${JSON.stringify(final_article)}`,
            );
          }
        }
      }
    }
  }

  async duplicateAides(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllAideData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.history_article_quizz_aides],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_aides = user.history.aide_interactions;

        for (const aide_utilisateur of liste_aides) {
          const aide_def = this.aideRepository.getAide(
            aide_utilisateur.content_id,
          );
          if (!aide_def) {
            continue;
          }
          const final_aide = Aide.newAideFromHistory(
            aide_def,
            aide_utilisateur,
          );

          try {
            await this.statistiqueExternalRepository.createAideData(
              user.external_stat_id,
              final_aide,
            );
          } catch (error) {
            console.error(error);
            console.error(
              `Error Creating Aide : ${JSON.stringify(final_aide)}`,
            );
          }
        }
      }
    }
  }

  async duplicateQuizz(block_size: number = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllQuizzData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.history_article_quizz_aides],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        const liste_qizz = user.history.quizz_interactions;

        for (const quizz_utilisateur of liste_qizz) {
          const quizz_def = this.quizzRepository.getQuizz(
            quizz_utilisateur.content_id,
          );
          if (!quizz_def) {
            continue;
          }

          const final_quizz = new Quizz(quizz_def);
          final_quizz.like_level = quizz_utilisateur.like_level;
          final_quizz.premier_coup_ok =
            quizz_utilisateur.has100ScoreFirstAttempt();
          final_quizz.date_premier_coup =
            quizz_utilisateur.getDateFirstAttempt();
          final_quizz.nombre_tentatives = quizz_utilisateur.getNombreEssais();

          try {
            await this.statistiqueExternalRepository.createQuizzData(
              user.external_stat_id,
              final_quizz,
            );
          } catch (error) {
            console.error(error);
            console.error(
              `Error Creating Quizz : ${JSON.stringify(final_quizz)}`,
            );
          }
        }
      }
    }
  }

  async duplicatePersonnalisation(block_size: number = 100) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllPersoData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.thematique_history, Scope.recommandation],
          {},
        );

      for (const user of current_user_list) {
        await this.updateExternalStatIdIfNeeded(user);

        try {
          await this.statistiqueExternalRepository.createPersonnalisationData(
            user,
          );
        } catch (error) {
          console.error(error);
          console.error(
            `Error Creating Personnalisation Data for ${
              user.id
            } : ${JSON.stringify(user.thematique_history)}`,
          );
        }
      }
    }
  }

  async computeBilanTousUtilisateurs(
    block_size: number = 100,
  ): Promise<string[]> {
    const error_liste = [];
    let computed_ok = 0;
    let skipped = 0;
    let errors = 0;

    const total_user_count = await this.utilisateurRepository.countAll();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.kyc, Scope.cache_bilan_carbone],
          {},
        );

      for (const user of current_user_list) {
        const a_jour = await this.estBilanAJour(user);
        if (a_jour) {
          skipped++;
          continue; // pas besoin de reclalculer
        }

        if (user.cache_bilan_carbone.forcer_calcul_stats) {
          user.cache_bilan_carbone.forcer_calcul_stats = false;
          await this.utilisateurRepository.updateUtilisateurNoConcurency(user, [
            Scope.cache_bilan_carbone,
          ]);
        }

        const situation =
          this.bilanCarboneUsecase.external_compute_situation(user);

        const progression =
          this.bilanCarboneUsecase.external_build_enchainement_bilan_recap(
            user,
          );

        try {
          const bilan =
            this.nGCCalculator.computeBasicBilanFromSituation(situation);

          await this.statistiqueExternalRepository.upsertBilanCarbone(
            user.external_stat_id,
            bilan,
            {
              total: progression.pourcentage_prog_totale_sans_mini_bilan,
              alimentation: Math.round(
                (progression.enchainement_alimentation_progression.current /
                  progression.enchainement_alimentation_progression.target) *
                  100,
              ),
              transport: Math.round(
                (progression.enchainement_transport_progression.current /
                  progression.enchainement_transport_progression.target) *
                  100,
              ),
              logement: Math.round(
                (progression.enchainement_logement_progression.current /
                  progression.enchainement_logement_progression.target) *
                  100,
              ),
              consommation: Math.round(
                (progression.enchainement_conso_progression.current /
                  progression.enchainement_conso_progression.target) *
                  100,
              ),
            },
          );

          computed_ok++;
          if (computed_ok > MAX_USER_TO_COMPUTE_BILAN_CARBONE) {
            break; // trop de calcul pour un run de batch unique
          }
        } catch (error) {
          console.log(error);
          errors++;
          error_liste.push(`BC KO [${user.id}] : ` + JSON.stringify(error));
        }
      }
    }

    return [
      `Computed OK = [${computed_ok}]`,
      `Skipped = [${skipped}]`,
      `Errors = [${errors}]`,
    ].concat(error_liste);
  }

  private async updateExternalStatIdIfNeeded(utilisateur: Utilisateur) {
    if (!utilisateur.external_stat_id) {
      utilisateur.external_stat_id = uuidv4();
      await this.utilisateurRepository.updateUtilisateurExternalStatId(
        utilisateur.id,
        utilisateur.external_stat_id,
      );
    }
  }

  private async estBilanAJour(utilisateur: Utilisateur): Promise<boolean> {
    const bilan_last_update_time =
      await this.statistiqueExternalRepository.getLastUpdateTime(
        utilisateur.external_stat_id,
      );

    const kyc_last_update = utilisateur.kyc_history.getLastUpdate().getTime();

    return (
      bilan_last_update_time &&
      bilan_last_update_time.getTime() > kyc_last_update &&
      !utilisateur.cache_bilan_carbone.forcer_calcul_stats
    );
  }
}
