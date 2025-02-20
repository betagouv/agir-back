import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import {
  QuizzFilter,
  QuizzRepository,
} from '../infrastructure/repository/quizz.repository';
import { Recommandation } from '../domain/contenu/recommandation';
import { ContentType } from '../../src/domain/contenu/contentType';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { Thematique } from '../domain/thematique/thematique';
import { Categorie } from '../../src/domain/contenu/categorie';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { Article } from '../domain/contenu/article';
import { Quizz } from '../domain/contenu/quizz';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private personnalisator: Personnalisator,
  ) {}

  async listRecommandationsV2(
    utilisateurId: string,
    thematique?: Thematique,
  ): Promise<Recommandation[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const articles = await this.getArticles(utilisateur, thematique);

    const quizzes = await this.getQuizzes(utilisateur, 10, thematique);

    let kycs = await this.getKYC(utilisateur, thematique);

    if (kycs.length > 0) {
      PonderationApplicativeManager.sortContent(kycs);
      kycs = [kycs[0]];
    }

    let content: Recommandation[] = [];
    content.push(...articles);
    content.push(...quizzes);
    content.push(...kycs);

    PonderationApplicativeManager.sortContent(content);

    content = content.slice(0, 6);

    return this.personnalisator.personnaliser(content, utilisateur);
  }

  private getKYC(
    utilisateur: Utilisateur,
    thematique?: Thematique,
  ): Recommandation[] {
    const kycs = utilisateur.kyc_history.getKYCsNeverAnswered(
      Categorie.recommandation,
      thematique,
    );

    PonderationApplicativeManager.increaseScoreContentOfList(
      kycs,
      utilisateur.tag_ponderation_set,
    );

    return this.mapKYCToRecommandation(kycs);
  }

  private mapKYCToRecommandation(kycs: QuestionKYC[]): Recommandation[] {
    return kycs.map((e) => ({
      content_id: e.code,
      image_url:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1720704333/Screenshot_2024_07_11_at_15_24_52_f5226c666e.png',
      points: e.points,
      thematique_principale: e.thematique ? e.thematique : Thematique.climat,
      score: e.score,
      titre: e.question,
      type: ContentType.kyc,
    }));
  }

  private async getArticles(
    utilisateur: Utilisateur,
    thematique?: Thematique,
  ): Promise<Recommandation[]> {
    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
    });

    const code_commune = await this.communeRepository.getCodeCommune(
      utilisateur.logement.code_postal,
      utilisateur.logement.commune,
    );

    const dept_region =
      await this.communeRepository.findDepartementRegionByCodePostal(
        utilisateur.logement.code_postal,
      );

    const filtre: ArticleFilter = {
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: articles_lus,
      categorie: Categorie.recommandation,
      date: new Date(),
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    };
    if (thematique) {
      filtre.thematiques = [Thematique[thematique]];
    }

    const articles_defs = await this.articleRepository.searchArticles(filtre);

    const articles = articles_defs.map(
      (article_def) => new Article(article_def),
    );
    PonderationApplicativeManager.increaseScoreContentOfList(
      articles,
      utilisateur.tag_ponderation_set,
    );

    return articles.map((e) => ({
      ...e,
      type: ContentType.article,
    }));
  }

  private async getQuizzes(
    utilisateur: Utilisateur,
    max_number: number,
    thematique?: Thematique,
  ): Promise<Recommandation[]> {
    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();

    const filtre: QuizzFilter = {
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: quizz_attempted,
      categorie: Categorie.recommandation,
      date: new Date(),
      maxNumber: max_number,
    };

    if (thematique) {
      filtre.thematiques = [Thematique[thematique]];
    }

    let quizzes_defs = await this.quizzRepository.searchQuizzes(filtre);

    let quizzes = quizzes_defs.map((q) => new Quizz(q));

    PonderationApplicativeManager.increaseScoreContentOfList(
      quizzes,
      utilisateur.tag_ponderation_set,
    );

    return quizzes.map((e) => ({
      ...e,
      type: ContentType.quizz,
    }));
  }
}
