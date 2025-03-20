import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Action } from '../../../domain/actions/action';
import { Aide } from '../../../domain/aides/aide';
import { Article } from '../../../domain/contenu/article';
import { Quizz } from '../../../domain/contenu/quizz';
import { Scope, Utilisateur } from '../../../domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../infrastructure/repository/action.repository';
import { AideRepository } from '../../../infrastructure/repository/aide.repository';
import { ArticleRepository } from '../../../infrastructure/repository/article.repository';
import { QuizzRepository } from '../../../infrastructure/repository/quizz.repository';
import { StatistiqueExternalRepository } from '../../../infrastructure/repository/statitstique.external.repository';
import { UtilisateurRepository } from '../../../infrastructure/repository/utilisateur/utilisateur.repository';

const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

@Injectable()
export class DuplicateBDDForStatsUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private statistiqueExternalRepository: StatistiqueExternalRepository,
    private actionRepository: ActionRepository,
    private articleRepository: ArticleRepository,
    private aideRepository: AideRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async duplicateUtilisateur(block_size: number = 100) {
    const total_user_count = await this.utilisateurRepository.countAll();

    await this.statistiqueExternalRepository.deleteAllUserData();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.logement, Scope.gamification],
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

  async duplicateKYC(block_size: number = 100) {
    const total_user_count = await this.utilisateurRepository.countAll();

    const start_date = new Date(Date.now() - TWO_DAYS_MS);

    await this.statistiqueExternalRepository.deleteAllKYCData();

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

        const liste_kyc = user.kyc_history.getRawAnsweredKYCsAfter(start_date);
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

  async duplicateAction(block_size: number = 100) {
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

          const final_action = new Action(action_def);
          final_action.faite_le = action_utilisateur.faite_le;
          final_action.vue_le = action_utilisateur.vue_le;

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

  async duplicateArticle(block_size: number = 100) {
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
          final_article.read_date = article_utilisateur.read_date;
          final_article.like_level = article_utilisateur.like_level;
          final_article.favoris = article_utilisateur.favoris;

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

  async duplicateAides(block_size: number = 100) {
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
          const final_aide = new Aide(aide_def);
          final_aide.vue_at = aide_utilisateur.vue_at;
          final_aide.clicked_infos = aide_utilisateur.clicked_infos;
          final_aide.clicked_demande = aide_utilisateur.clicked_demande;

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

  async duplicateQuizz(block_size: number = 100) {
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

  private async updateExternalStatIdIfNeeded(utilisateur: Utilisateur) {
    if (!utilisateur.external_stat_id) {
      utilisateur.external_stat_id = uuidv4();
      await this.utilisateurRepository.updateUtilisateurExternalStatId(
        utilisateur.id,
        utilisateur.external_stat_id,
      );
    }
  }
}
