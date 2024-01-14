import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
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
    let articles = await this.articleRepository.searchArticles({
      code_postal: utilisateur.code_postal,
      exclude_ids: articles_lus,
    });

    const article_recommandation =
      await this.articleRepository.getArticleRecommandations(
        utilisateur.version_ponderation,
      );

    if (article_recommandation.liste.length > 0) {
      articles =
        article_recommandation.filterAndOrderArticlesOrQuizzes(articles);
    }

    if (articles.length > 2) articles = articles.slice(0, 2);

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

    let quizzes = await this.quizzRepository.searchQuizzes({
      code_postal: utilisateur.code_postal,
      asc_difficulty: true,
      exclude_ids: quizz_attempted,
    });

    const quizz_recommandation =
      await this.quizzRepository.getQuizzRecommandations(
        utilisateur.version_ponderation,
      );

    if (quizz_recommandation.liste.length > 0) {
      quizzes = quizz_recommandation.filterAndOrderArticlesOrQuizzes(quizzes);
    }

    if (quizzes.length > 2) quizzes = quizzes.slice(0, 2);

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
