import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { Thematique } from '../../src/domain/thematique';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<Interaction[]> {
    let result: Interaction[] = [];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    if (utilisateur.does_get_article_quizz_from_repo()) {
      const articles_lus = utilisateur.history.listeIdsArticlesLus();
      const articles = await this.articleRepository.searchArticles({
        code_postal: utilisateur.code_postal,
        maxNumber: 2,
        asc_difficulty: true,
        exclude_ids: articles_lus,
      });

      const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();
      const quizzes = await this.quizzRepository.searchQuizzes({
        code_postal: utilisateur.code_postal,
        maxNumber: 2,
        asc_difficulty: true,
        exclude_ids: quizz_attempted,
      });
      const interactions_articles = articles.map(
        (article) =>
          new Interaction({
            ...article,
            id: 'FAKE_ID',
            type: InteractionType.article,
            tags: [],
            locked: false,
            url: null,
            done: false,
            done_at: null,
            clicked: false,
            clicked_at: null,
            day_period: null,
            like_level: null,
            pinned_at_position: null,
            points_en_poche: false,
            quizz_score: null,
            raison_lock: null,
            scheduled_reset: null,
            score: 0,
            seen: 0,
            seen_at: null,
            utilisateurId: utilisateur.id,
            thematique_gamification_titre: null,
            soustitre: null,
            thematique_gamification: Thematique.climat,
            thematiques: [],
            duree: null,
            frequence: null,
            created_at: null,
            updated_at: null,
          }),
      );
      result = result.concat(interactions_articles);

      const interactions_quizz = quizzes.map(
        (quizz) =>
          new Interaction({
            ...quizz,
            id: 'FAKE_ID',
            type: InteractionType.article,
            tags: [],
            locked: false,
            url: null,
            done: false,
            done_at: null,
            clicked: false,
            clicked_at: null,
            day_period: null,
            like_level: null,
            pinned_at_position: null,
            points_en_poche: false,
            quizz_score: null,
            raison_lock: null,
            scheduled_reset: null,
            score: 0,
            seen: 0,
            seen_at: null,
            utilisateurId: utilisateur.id,
            thematique_gamification_titre: null,
            soustitre: null,
            thematique_gamification: Thematique.climat,
            thematiques: [],
            duree: null,
            frequence: null,
            created_at: null,
            updated_at: null,
          }),
      );
      return result.concat(interactions_quizz);
    }

    const liste_articles = await this.getArticlesForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );

    const liste_quizz = await this.getQuizzForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );

    result = result.concat(liste_articles);
    result = result.concat(liste_quizz);

    return result.concat();
  }

  async getArticlesForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: 2,
      type: InteractionType.article,
      pinned: false,
      code_postal,
      done: false,
    });
  }

  async getQuizzForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: 2,
      type: InteractionType.quizz,
      pinned: false,
      code_postal,
      done: false,
    });
  }
}
