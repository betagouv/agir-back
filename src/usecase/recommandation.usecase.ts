import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Recommandation } from '../domain/contenu/recommandation';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { Article } from '../../src/domain/article/article';
import { Quizz } from '../../src/domain/quizz/quizz';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async listRecommandations(utilisateurId: string): Promise<Recommandation[]> {
    let result: Recommandation[] = [];

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const articles = await this.getArticles(utilisateur);

    const quizzes = await this.getQuizzes(utilisateur);

    articles.forEach((article) => {
      result.push({
        ...article,
        type: ContentType.article,
        thematique_principale: article.thematique_principale,
      });
    });

    quizzes.forEach((quizz) => {
      result.push({
        ...quizz,
        type: ContentType.quizz,
        thematique_principale: quizz.thematique_principale,
      });
    });

    return result;
  }

  private async getArticles(utilisateur: Utilisateur): Promise<Article[]> {
    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
    });
    let articles = await this.articleRepository.searchArticles({
      code_postal: utilisateur.code_postal,
      exclude_ids: articles_lus,
    });

    const article_recommandation =
      await this.articleRepository.getArticleRecommandations(
        utilisateur.version_ponderation,
        utilisateur.id,
      );

    if (article_recommandation.liste.length > 0) {
      articles =
        article_recommandation.filterAndOrderArticlesOrQuizzes(articles);
    }

    if (articles.length > 2) articles = articles.slice(0, 2);

    return articles;
  }

  private async getQuizzes(utilisateur: Utilisateur): Promise<Quizz[]> {
    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();

    let quizzes = await this.quizzRepository.searchQuizzes({
      code_postal: utilisateur.code_postal,
      asc_difficulty: true,
      exclude_ids: quizz_attempted,
    });

    const quizz_recommandation =
      await this.quizzRepository.getQuizzRecommandations(
        utilisateur.version_ponderation,
        utilisateur.id,
      );

    if (quizz_recommandation.liste.length > 0) {
      quizzes = quizz_recommandation.filterAndOrderArticlesOrQuizzes(quizzes);
    }

    if (quizzes.length > 2) quizzes = quizzes.slice(0, 2);

    return quizzes;
  }
}
