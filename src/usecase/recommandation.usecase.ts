import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Thematique } from '../domain/thematique';
import {
  Recommandation,
  RecommandationType,
} from '../../src/domain/recommandation';
import { ThematiqueRepository } from '../../src/infrastructure/repository/thematique.repository';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async listRecommandations(utilisateurId: string): Promise<Recommandation[]> {
    let result: Recommandation[] = [];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    const articles_lus = utilisateur.history.listeIdsArticlesLus();
    const articles = await this.articleRepository.searchArticles({
      code_postal: utilisateur.code_postal,
      maxNumber: 2,
      asc_difficulty: true,
      exclude_ids: articles_lus,
    });
    articles.forEach((article) => {
      result.push({
        ...article,
        type: RecommandationType.article,
        thematique_gamification_titre:
          ThematiqueRepository.getLibelleThematique(
            article.thematique_gamification,
          ),
      });
    });

    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();
    const quizzes = await this.quizzRepository.searchQuizzes({
      code_postal: utilisateur.code_postal,
      maxNumber: 2,
      asc_difficulty: true,
      exclude_ids: quizz_attempted,
    });
    quizzes.forEach((quizz) => {
      result.push({
        ...quizz,
        type: RecommandationType.quizz,
        thematique_gamification_titre:
          ThematiqueRepository.getLibelleThematique(
            quizz.thematique_gamification,
          ),
      });
    });

    return result;
  }
}
