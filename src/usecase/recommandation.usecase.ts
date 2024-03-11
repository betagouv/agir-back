import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Recommandation } from '../domain/contenu/recommandation';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { PonderationTagHelper } from '../../src/domain/utilisateur/ponderationTags';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async listRecommandations(
    utilisateurId: string,
    exclude_defi: boolean,
  ): Promise<Recommandation[]> {
    let result: Recommandation[] = [];

    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const articles = await this.getArticles(utilisateur);

    const quizzes = await this.getQuizzes(utilisateur);

    let defis = [];
    if (!exclude_defi) {
      defis = await this.getDefis(utilisateur);
    }

    result.push(...articles);
    result.push(...quizzes);
    result.push(...defis);

    result.sort((a, b) => b.score - a.score);

    if (result.length > 10) result = result.slice(0, 10);

    return result;
  }

  private async getDefis(utilisateur: Utilisateur): Promise<Recommandation[]> {
    const defis = utilisateur.kyc.getDefisRestants();

    PonderationTagHelper.computeAndAffectScores(defis, utilisateur);

    return defis.map((e) => ({
      content_id: e.id,
      image_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Logo_Relevez_le_d%C3%A9fi.png/320px-Logo_Relevez_le_d%C3%A9fi.png',
      points: e.points,
      thematique_principale: e.thematique,
      score: e.score,
      titre: e.question,
      type: ContentType.defi,
    }));
  }

  private async getArticles(
    utilisateur: Utilisateur,
  ): Promise<Recommandation[]> {
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

    return articles.map((e) => ({
      ...e,
      type: ContentType.article,
    }));
  }

  private async getQuizzes(
    utilisateur: Utilisateur,
  ): Promise<Recommandation[]> {
    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();

    let quizzes = await this.quizzRepository.searchQuizzes({
      code_postal: utilisateur.code_postal,
      exclude_ids: quizz_attempted,
    });

    const scoring = await this.quizzRepository.getQuizzRecommandations(
      utilisateur.id,
    );

    scoring.affectScores(quizzes);

    return quizzes.map((e) => ({
      ...e,
      type: ContentType.quizz,
    }));
  }
}
