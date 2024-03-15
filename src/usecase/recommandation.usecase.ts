import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Recommandation } from '../domain/contenu/recommandation';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';

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
    result = this.shuffle(result);

    result.push(...defis);

    result.sort((a, b) => b.score - a.score);

    if (result.length > 10) result = result.slice(0, 10);

    return result;
  }

  private async getDefis(utilisateur: Utilisateur): Promise<Recommandation[]> {
    const defis = utilisateur.kyc.getDefisRestants();

    defis.forEach((defi) => {
      PonderationApplicativeManager.increaseScoreContent(
        defi,
        utilisateur.tag_ponderation_set,
      );
    });

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
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: articles_lus,
    });

    articles.forEach((article) => {
      PonderationApplicativeManager.increaseScoreContent(
        article,
        utilisateur.tag_ponderation_set,
      );
    });

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
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: quizz_attempted,
    });

    quizzes.forEach((quizz) => {
      PonderationApplicativeManager.increaseScoreContent(
        quizz,
        utilisateur.tag_ponderation_set,
      );
    });

    return quizzes.map((e) => ({
      ...e,
      type: ContentType.quizz,
    }));
  }

  private shuffle<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}
