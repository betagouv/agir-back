import { Injectable } from '@nestjs/common';
import { Categorie } from '../../src/domain/contenu/categorie';
import { ContentType } from '../../src/domain/contenu/contentType';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Article } from '../domain/contenu/article';
import { Quizz } from '../domain/contenu/quizz';
import { Recommandation } from '../domain/contenu/recommandation';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { ProfileRecommandationUtilisateur } from '../domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Thematique } from '../domain/thematique/thematique';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import {
  ArticleFilter,
  ArticleRepository,
} from '../infrastructure/repository/article.repository';
import {
  QuizzFilter,
  QuizzRepository,
} from '../infrastructure/repository/quizz.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

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
    nombre: number = 6,
    types: ContentType[] = [
      ContentType.article,
      ContentType.quizz,
      ContentType.kyc,
    ],
  ): Promise<Recommandation[]> {
    let scope = [
      Scope.history_article_quizz_aides,
      Scope.logement,
      Scope.recommandation,
    ];
    if (types.length === 0) {
      types = [ContentType.article, ContentType.quizz, ContentType.kyc];
    }
    if (types.includes(ContentType.kyc)) {
      scope.push(Scope.kyc);
    }
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      scope,
    );
    Utilisateur.checkState(utilisateur);

    let articles: Recommandation[] = [];
    let quizzes: Recommandation[] = [];
    let kycs: Recommandation[] = [];

    if (types.includes(ContentType.article)) {
      articles = await this.getArticles(utilisateur, thematique);
    }
    if (types.includes(ContentType.quizz)) {
      quizzes = await this.getQuizzes(utilisateur, 10, thematique);
    }
    if (types.includes(ContentType.kyc)) {
      kycs = this.getKYC(utilisateur, thematique);
    }

    if (kycs.length > 0) {
      PonderationApplicativeManager.sortContent(kycs);
      kycs = [kycs[0]];
    }

    let content: Recommandation[] = [];
    content.push(...articles);
    content.push(...quizzes);
    content.push(...kycs);

    ProfileRecommandationUtilisateur.sortScoredContent(content);

    content = content.slice(0, nombre);

    return this.personnalisator.personnaliser(content, utilisateur, [
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
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
      pourcent_match: e.pourcent_match,
      titre: e.question,
      type: ContentType.kyc,
      explicationScore: undefined,
      isLocal: false,
    }));
  }

  private async getArticles(
    utilisateur: Utilisateur,
    thematique?: Thematique,
  ): Promise<Recommandation[]> {
    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
    });

    const dept_region =
      this.communeRepository.findDepartementRegionByCodeCommune(
        utilisateur.logement.code_commune,
      );

    const filtre: ArticleFilter = {
      exclude_ids: articles_lus,
      categorie: Categorie.recommandation,
      date: new Date(),
      commune_pour_partenaire: utilisateur.logement.code_commune,
      departement_pour_partenaire: dept_region?.code_departement,
      region_pour_partenaire: dept_region?.code_region,
    };
    if (thematique) {
      filtre.thematiques = [Thematique[thematique]];
    }

    const articles_defs = await this.articleRepository.searchArticles(filtre);

    let articles = articles_defs.map((article_def) => new Article(article_def));

    articles =
      utilisateur.recommandation.trierEtFiltrerRecommandations(articles);

    return articles.map((e) => ({
      ...e,
      type: ContentType.article,
      isLocal: e.isLocal(),
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
      isLocal: e.isLocal(),
    }));
  }
}
