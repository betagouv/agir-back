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
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { Thematique } from '../../src/domain/contenu/thematique';
import { App } from '../domain/app';
import { Feature } from '../../src/domain/gamification/feature';
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

  async listRecommandations(utilisateurId: string): Promise<Recommandation[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.history_article_quizz_aides,
        Scope.logement,
        Scope.defis,
        Scope.unlocked_features,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const articles = await this.getArticles(utilisateur);

    const quizzes = await this.getQuizzes(utilisateur, 10);

    let defis_en_cours = [];
    let defis_restants = [];
    let kycs = [];
    let nombre_content_restants = 6;

    if (
      App.defiEnabled() &&
      utilisateur.unlocked_features.isUnlocked(Feature.defis)
    ) {
      defis_en_cours = this.getDefisEnCours(utilisateur);

      defis_restants = this.getDefisRestantsAvecTri(utilisateur);
      const nombre_defi_restant = Math.min(6 - defis_en_cours.length, 2);
      defis_restants = defis_restants.slice(0, nombre_defi_restant);

      nombre_content_restants =
        6 - defis_en_cours.length - defis_restants.length;
    }

    if (App.kycRecoEnabled()) {
      kycs = await this.getKYC(utilisateur);
      if (kycs.length > 0) {
        PonderationApplicativeManager.sortContent(kycs);
        kycs = [kycs[0]];
      }
    }

    let content: Recommandation[] = [];
    content.push(...articles);
    content.push(...quizzes);
    content.push(...kycs);
    content = this.shuffle(content);

    PonderationApplicativeManager.sortContent(content);

    content = content.slice(0, nombre_content_restants);

    const result = defis_en_cours.concat(defis_restants, content);

    return this.personnalisator.personnaliser(result, utilisateur);
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

  private getDefisRestantsAvecTri(utilisateur: Utilisateur): Recommandation[] {
    const defis =
      utilisateur.defi_history.getDefisRestantsByCategorieAndThematique(
        Categorie.recommandation,
      );

    PonderationApplicativeManager.increaseScoreContentOfList(
      defis,
      utilisateur.tag_ponderation_set,
    );

    const result = this.mapDefiToRecommandation(defis);

    PonderationApplicativeManager.sortContent(result);

    const final_result = result.filter((d) => d.score > -50);

    return this.personnalisator.personnaliser(final_result, utilisateur);
  }

  private getDefisEnCours(utilisateur: Utilisateur): Recommandation[] {
    const defis = utilisateur.defi_history.getDefisOfStatus([
      DefiStatus.en_cours,
    ]);

    return this.mapDefiToRecommandation(defis);
  }

  private mapDefiToRecommandation(defis: Defi[]): Recommandation[] {
    return defis.map((e) => ({
      content_id: e.id,
      image_url:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1711467455/Illustration_defis_63f2bfed5a.svg',
      points: e.points,
      thematique_principale: e.thematique,
      score: e.score,
      titre: e.titre,
      type: ContentType.defi,
      jours_restants: e.getJourRestants(),
      status_defi: e.getStatus(),
    }));
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

  private shuffle<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }
}
