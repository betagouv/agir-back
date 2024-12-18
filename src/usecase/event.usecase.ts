import { Injectable } from '@nestjs/common';
import { EventType, AppEvent } from '../domain/appEvent';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Scope } from '../../src/domain/utilisateur/utilisateur';
import { ContentType } from '../domain/contenu/contentType';
import { LiveService } from '../../src/domain/service/serviceDefinition';
import { BibliothequeUsecase } from './bibliotheque.usecase';

@Injectable()
export class EventUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private bibliothequeUsecase: BibliothequeUsecase,
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.todo],
    );
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    utilisateur.history.defavoriserArticle(event.content_id);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processArticleFavoris(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    utilisateur.history.favoriserArticle(event.content_id);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLike(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.todo],
    );
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      ContentType.recommandations,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessProfile(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.todo],
    );
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      ContentType.profile,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessCatalogueAides(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.todo],
    );
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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.todo],
    );
    const found = utilisateur.parcours_todo.findTodoElementByServiceId(
      event.service_id,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processCelebration(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.gamification, Scope.unlocked_features],
    );
    utilisateur.gamification.terminerCelebration(
      event.celebration_id,
      utilisateur,
    );
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLectureArticle(utilisateurId: string, event: AppEvent) {
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

    await this.bibliothequeUsecase.readArticle(event.content_id, utilisateur);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processQuizzScore(utilisateurId: string, event: AppEvent) {
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

    await this.bibliothequeUsecase.setQuizzResult(
      event.content_id,
      event.number_value,
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
