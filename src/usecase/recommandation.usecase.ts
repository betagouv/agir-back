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
      });
    });

    quizzes.forEach((quizz) => {
      result.push({
        ...quizz,
        type: ContentType.quizz,
      });
    });

    result.sort((a, b) => b.score - a.score);

    if (result.length > 10) result = result.slice(0, 10);

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

    const scoring = await this.articleRepository.getArticleRecommandations(
      utilisateur.id,
    );

    scoring.affectScores(articles);

    return articles;
  }

  private async getQuizzes(utilisateur: Utilisateur): Promise<Quizz[]> {
    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();

    let quizzes = await this.quizzRepository.searchQuizzes({
      code_postal: utilisateur.code_postal,
      exclude_ids: quizz_attempted,
    });

    const scoring = await this.quizzRepository.getQuizzRecommandations(
      utilisateur.id,
    );

    scoring.affectScores(quizzes);

    return quizzes;
  }
}
