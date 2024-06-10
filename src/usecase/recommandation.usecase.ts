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
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { PonderationApplicativeManager } from '../../src/domain/scoring/ponderationApplicative';
import { Defi, DefiStatus } from '../../src/domain/defis/defi';
import { QuestionKYC } from '../../src/domain/kyc/questionQYC';
import { Thematique } from '../../src/domain/contenu/thematique';
import { App } from '../domain/app';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { Feature } from '../../src/domain/gamification/feature';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { Categorie } from '../../src/domain/contenu/categorie';
import { Personnalisation } from 'src/domain/contenu/personnalisation';

@Injectable()
export class RecommandationUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private defiRepository: DefiRepository,
    private kycRepository: KycRepository,
  ) {}

  async listRecommandationsV2(
    utilisateurId: string,
    univers?: string,
  ): Promise<Recommandation[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(catalogue);

    const articles = await this.getArticles(utilisateur, univers);

    const quizzes = await this.getQuizzes(utilisateur, univers);

    let kycs = await this.getKYC(utilisateur, univers);

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
    return content;
  }

  async listRecommandations(utilisateurId: string): Promise<Recommandation[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const articles = await this.getArticles(utilisateur);

    const quizzes = await this.getQuizzes(utilisateur);

    let defis_en_cours = [];
    let defis_restants = [];
    let kycs = [];
    let nombre_content_restants = 6;

    if (
      App.defiEnabled() &&
      utilisateur.unlocked_features.isUnlocked(Feature.defis)
    ) {
      const defiDefinitions = await this.defiRepository.list({
        categorie: Categorie.recommandation,
        date: new Date(),
      });
      utilisateur.defi_history.setCatalogue(defiDefinitions);

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

    return defis_en_cours.concat(defis_restants, content);
  }

  private getKYC(utilisateur: Utilisateur, univers?: string): Recommandation[] {
    const kycs = utilisateur.kyc_history.getKYCRestantes(
      Categorie.recommandation,
      univers,
    );

    PonderationApplicativeManager.increaseScoreContentOfList(
      kycs,
      utilisateur.tag_ponderation_set,
    );

    return this.mapKYCToRecommandation(kycs);
  }

  private getDefisRestantsAvecTri(utilisateur: Utilisateur): Recommandation[] {
    const defis = utilisateur.defi_history.getDefisRestants(
      Categorie.recommandation,
    );

    PonderationApplicativeManager.increaseScoreContentOfList(
      defis,
      utilisateur.tag_ponderation_set,
    );

    const result = this.mapDefiToRecommandation(
      defis,
      utilisateur.getPersonnalisation(),
    );

    PonderationApplicativeManager.sortContent(result);

    return result.filter((d) => d.score > -50);
  }

  private getDefisEnCours(utilisateur: Utilisateur): Recommandation[] {
    const defis = utilisateur.defi_history.getDefisOfStatus([
      DefiStatus.en_cours,
    ]);

    return this.mapDefiToRecommandation(
      defis,
      utilisateur.getPersonnalisation(),
    );
  }

  private mapDefiToRecommandation(
    defis: Defi[],
    personnalisation: Personnalisation,
  ): Recommandation[] {
    return defis.map((e) => ({
      content_id: e.id,
      image_url:
        'https://res.cloudinary.com/dq023imd8/image/upload/v1711467455/Illustration_defis_63f2bfed5a.svg',
      points: e.points,
      thematique_principale: e.thematique,
      score: e.score,
      titre: e.getTitre(personnalisation),
      type: ContentType.defi,
      jours_restants: e.getJourRestants(),
      status_defi: e.getStatus(),
    }));
  }

  private mapKYCToRecommandation(kycs: QuestionKYC[]): Recommandation[] {
    return kycs.map((e) => ({
      content_id: e.id,
      image_url:
        'https://www.google.com/url?sa=i&url=https%3A%2F%2Fopenclipart.org%2Fdetail%2F321572%2Fi-have-a-small-question&psig=AOvVaw1_ErxUJbZIoqQ8u-1sbgB5&ust=1711202048405000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLijtMOCiIUDFQAAAAAdAAAAABAS',
      points: e.points,
      thematique_principale: e.thematique ? e.thematique : Thematique.climat,
      score: e.score,
      titre: e.question,
      type: ContentType.kyc,
    }));
  }

  private async getArticles(
    utilisateur: Utilisateur,
    univers?: string,
  ): Promise<Recommandation[]> {
    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
    });
    const filtre: ArticleFilter = {
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: articles_lus,
      categorie: Categorie.recommandation,
      date: new Date(),
    };
    if (univers) {
      filtre.thematiques = [Thematique[univers]];
    }
    let articles = await this.articleRepository.searchArticles(filtre);

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
    univers?: string,
  ): Promise<Recommandation[]> {
    const quizz_attempted = utilisateur.history.listeIdsQuizzAttempted();

    const filtre: QuizzFilter = {
      code_postal: utilisateur.logement.code_postal,
      exclude_ids: quizz_attempted,
      categorie: Categorie.recommandation,
      date: new Date(),
    };

    if (univers) {
      filtre.thematiques = [Thematique[univers]];
    }

    let quizzes = await this.quizzRepository.searchQuizzes(filtre);

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
