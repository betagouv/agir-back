import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import { Bibliotheque } from '../domain/contenu/bibliotheque';
import { Thematique } from '../domain/contenu/thematique';
import { ApplicationError } from '../../src/infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { Article } from '../domain/contenu/article';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { Quizz } from '../domain/contenu/quizz';
import { ContentType } from '../domain/contenu/contentType';
import { DefiRepository } from '../infrastructure/repository/defi.repository';

@Injectable()
export class BibliothequeUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private personnalisator: Personnalisator,
  ) {}

  async rechercheBiblio(
    utilisateurId: string,
    filtre_thematiques: Thematique[],
    titre: string,
    favoris: boolean,
  ): Promise<Bibliotheque> {
    let result = new Bibliotheque();

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const articles_lus = utilisateur.history.searchArticlesIds({
      est_lu: true,
      est_favoris: favoris,
    });

    let article_definitions = await this.articleRepository.searchArticles({
      include_ids: articles_lus,
      thematiques:
        filtre_thematiques.length === 0 ? undefined : filtre_thematiques,
      titre_fragment: titre,
    });

    const ordered_articles =
      utilisateur.history.orderArticlesByReadDateAndFavoris(
        article_definitions,
      );

    result.addArticles(ordered_articles);

    for (const thematique of ThematiqueRepository.getAllThematiques()) {
      if (thematique !== Thematique.services_societaux)
        result.addSelectedThematique(
          thematique,
          filtre_thematiques.includes(thematique),
        );
    }

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  public async getArticleAnonymous(content_id: string): Promise<Article> {
    const article_definition =
      await this.articleRepository.getArticleDefinitionByContentId(content_id);

    if (!article_definition) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    return new Article(article_definition);
  }

  public async getQuizzAnonymous(content_id: string): Promise<Quizz> {
    const quizz_def = await this.quizzRepository.getQuizzDefinitionByContentId(
      content_id,
    );

    if (!quizz_def) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const quizz = new Quizz(quizz_def);

    if (quizz_def.article_id) {
      quizz.article_contenu = (
        await this.articleRepository.getArticleDefinitionByContentId(
          quizz_def.article_id,
        )
      )?.contenu;
    }

    return quizz;
  }

  public async getArticle(
    utilisateurId: string,
    content_id: string,
  ): Promise<Article> {
    const article_definition =
      await this.articleRepository.getArticleDefinitionByContentId(content_id);

    if (!article_definition) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.history_article_quizz_aides,
        Scope.gamification,
        Scope.missions,
        Scope.kyc,
        Scope.todo,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const result =
      utilisateur.history.getArticleFromBibliotheque(article_definition);

    await this.readArticle(content_id, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  public async addQuizzAttempt(
    utilisateurId: string,
    content_id: string,
    pourcent: number,
  ) {
    if (pourcent === null || pourcent === undefined) {
      ApplicationError.throwMissingPourcent();
    }
    const rounded_pourcent = Math.round(pourcent);
    if (isNaN(rounded_pourcent)) {
      ApplicationError.throwBadQuizzPourcent(pourcent);
    }
    if (rounded_pourcent < 0 || rounded_pourcent > 100) {
      ApplicationError.throwBadQuizzPourcent(pourcent);
    }

    const quizz_definition =
      await this.quizzRepository.getQuizzDefinitionByContentId(content_id);

    if (!quizz_definition) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.history_article_quizz_aides,
        Scope.gamification,
        Scope.missions,
        Scope.kyc,
        Scope.todo,
      ],
    );

    Utilisateur.checkState(utilisateur);

    await this.setQuizzResult(content_id, rounded_pourcent, utilisateur);

    await this.readArticle(quizz_definition.article_id, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  // FIXME : should be private
  public async setQuizzResult(
    content_id: string,
    pourcent: number,
    utilisateur: Utilisateur,
  ) {
    utilisateur.history.quizzAttempt(content_id, pourcent);

    const quizz_def = await this.quizzRepository.getQuizzDefinitionByContentId(
      content_id,
    );
    if (
      !utilisateur.history.sontPointsQuizzEnPoche(content_id) &&
      pourcent === 100
    ) {
      utilisateur.gamification.ajoutePoints(quizz_def.points, utilisateur);
      utilisateur.history.declarePointsQuizzEnPoche(content_id);
      this.updateUserTodo(
        utilisateur,
        ContentType.quizz,
        quizz_def.thematiques,
      );
    }

    utilisateur.missions.validateArticleOrQuizzDone(
      content_id,
      ContentType.quizz,
      pourcent,
    );

    utilisateur.missions.recomputeRecoDefi(
      utilisateur,
      DefiRepository.getCatalogue(),
    );
  }

  public async getQuizz(
    utilisateurId: string,
    content_id: string,
  ): Promise<Quizz> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const quizz_def = await this.quizzRepository.getQuizzDefinitionByContentId(
      content_id,
    );

    if (!quizz_def) {
      ApplicationError.throwQuizzNotFound(content_id);
    }

    const quizz = new Quizz(quizz_def);
    if (quizz_def.article_id) {
      quizz.article_contenu = (
        await this.articleRepository.getArticleDefinitionByContentId(
          quizz_def.article_id,
        )
      )?.contenu;
    }

    return this.personnalisator.personnaliser(quizz, utilisateur, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  // FIXME : should be private
  public async readArticle(content_id: string, utilisateur: Utilisateur) {
    if (!content_id) return;

    utilisateur.history.lireArticle(content_id);

    const article_definition =
      await this.articleRepository.getArticleDefinitionByContentId(content_id);

    if (!utilisateur.history.sontPointsArticleEnPoche(content_id)) {
      utilisateur.gamification.ajoutePoints(
        article_definition.points,
        utilisateur,
      );
      utilisateur.history.declarePointsArticleEnPoche(content_id);
    }
    this.updateUserTodo(
      utilisateur,
      ContentType.article,
      article_definition.thematiques,
    );

    utilisateur.missions.validateArticleOrQuizzDone(
      content_id,
      ContentType.article,
    );

    utilisateur.missions.recomputeRecoDefi(
      utilisateur,
      DefiRepository.getCatalogue(),
    );
  }

  private updateUserTodo(
    utilisateur: Utilisateur,
    type: ContentType,
    thematiques: Thematique[],
  ) {
    const matching =
      utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
        type,
        thematiques,
      );
    if (matching && !matching.element.isDone()) {
      matching.todo.makeProgress(matching.element);
    }
  }
}
