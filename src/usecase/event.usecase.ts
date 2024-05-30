import { Injectable } from '@nestjs/common';
import { EventType, AppEvent } from '../domain/appEvent';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { ContentType } from '../domain/contenu/contentType';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { Thematique } from '../domain/contenu/thematique';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import { LiveService } from '../../src/domain/service/serviceDefinition';

@Injectable()
export class EventUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async processEvent(utilisateurId: string, event: AppEvent) {
    switch (event.type) {
      case EventType.quizz_score:
        return await this.processQuizzScore(utilisateurId, event);
      case EventType.article_lu:
        return await this.processLectureArticle(utilisateurId, event);
      case EventType.celebration:
        return await this.processCelebration(utilisateurId, event);
      case EventType.service_installed:
        return await this.processServiceInstalled(utilisateurId, event);
      case EventType.access_catalogue_aides:
        return await this.processAccessCatalogueAides(utilisateurId);
      case EventType.access_profile:
        return await this.processAccessProfile(utilisateurId);
      case EventType.access_recommandations:
        return await this.processAccessRecommandations(utilisateurId);
      case EventType.like:
        return await this.processLike(utilisateurId, event);
      case EventType.article_favoris:
        return await this.processArticleFavoris(utilisateurId, event);
      case EventType.article_non_favoris:
        return await this.processArticleNonFavoris(utilisateurId, event);
      case EventType.access_conf_linky:
        return await this.processAccessConfLinky(utilisateurId);
    }
  }

  private async processAccessConfLinky(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const found = utilisateur.parcours_todo.findTodoElementByServiceId(
      LiveService.linky,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processArticleNonFavoris(
    utilisateurId: string,
    event: AppEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.history.defavoriserArticle(event.content_id);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processArticleFavoris(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.history.favoriserArticle(event.content_id);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLike(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    if (event.content_type === ContentType.article) {
      utilisateur.history.likerArticle(event.content_id, event.number_value);
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
    if (event.content_type === ContentType.quizz) {
      utilisateur.history.likerQuizz(event.content_id, event.number_value);
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }

  private async processAccessRecommandations(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      ContentType.recommandations,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessProfile(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      ContentType.profile,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessCatalogueAides(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      ContentType.aides,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processServiceInstalled(
    utilisateurId: string,
    event: AppEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    const found = utilisateur.parcours_todo.findTodoElementByServiceId(
      event.service_id,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processCelebration(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.gamification.terminerCelebration(
      event.celebration_id,
      utilisateur,
    );
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLectureArticle(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.history.lireArticle(event.content_id);
    const article = await this.articleRepository.getArticleByContentId(
      event.content_id,
    );
    if (!utilisateur.history.sontPointsArticleEnPoche(event.content_id)) {
      utilisateur.gamification.ajoutePoints(article.points);
      utilisateur.history.declarePointsArticleEnPoche(event.content_id);
    }
    this.updateUserTodo(utilisateur, ContentType.article, article.thematiques);

    utilisateur.missions.validateAricleOrQuizzDone(
      event.content_id,
      ContentType.article,
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processQuizzScore(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.history.quizzAttempt(event.content_id, event.number_value);

    const quizz = await this.quizzRepository.getQuizzByContentId(
      event.content_id,
    );
    if (
      !utilisateur.history.sontPointsQuizzEnPoche(event.content_id) &&
      event.number_value === 100
    ) {
      utilisateur.gamification.ajoutePoints(quizz.points);
      utilisateur.history.declarePointsQuizzEnPoche(event.content_id);
      this.updateUserTodo(utilisateur, ContentType.quizz, quizz.thematiques);
    }

    utilisateur.missions.validateAricleOrQuizzDone(
      event.content_id,
      ContentType.quizz,
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
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
