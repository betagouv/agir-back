import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Recommandation } from '../domain/contenu/recommandation';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { Defi } from '../../src/domain/defis/defi';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async listRecommandations(utilisateurId: string): Promise<Recommandation[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    const articles = await this.getArticles(utilisateur);

    const quizzes = await this.getQuizzes(utilisateur);

    const defis_en_cours = this.getDefisEnCours(utilisateur);

    let defis_restants = this.getDefisRestantsAvecTri(utilisateur);
    const nombre_defi_restant = Math.min(6 - defis_en_cours.length, 2);
    defis_restants = defis_restants.slice(0, nombre_defi_restant);

    const nombre_article_quizz_restants =
      6 - defis_en_cours.length - defis_restants.length;


    let content: Recommandation[] = [];
    content.push(...articles);
    content.push(...quizzes);
    content = this.shuffle(content);

    content.sort((a, b) => b.score - a.score);

    content = content.slice(0, nombre_article_quizz_restants);

    return defis_en_cours.concat(defis_restants, content);
  }

  private getDefisRestantsAvecTri(utilisateur: Utilisateur): Recommandation[] {
    const defis = utilisateur.defi_history.getDefisRestants();

    PonderationApplicativeManager.increaseScoreContentOfList(
      defis,
      utilisateur.tag_ponderation_set,
    );

    const result = this.mapDefiToRecommandation(defis);
    result.sort((a, b) => b.score - a.score);
    return result;
  }
  private getDefisEnCours(utilisateur: Utilisateur): Recommandation[] {
    const defis = utilisateur.defi_history.getDefisEnCours();

    return this.mapDefiToRecommandation(defis);
  }

  private mapDefiToRecommandation(defis: Defi[]): Recommandation[] {
    return defis.map((e) => ({
      content_id: e.id,
      image_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Logo_Relevez_le_d%C3%A9fi.png/320px-Logo_Relevez_le_d%C3%A9fi.png',
      points: e.points,
      thematique_principale: e.thematique,
      score: e.score,
      titre: e.titre,
      type: ContentType.defi,
      jours_restants: e.getJourRestants(),
      status_defi: e.getStatus(),
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
