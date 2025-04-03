import { Injectable } from '@nestjs/common';
import { Scope } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AppEvent, EventType } from '../domain/appEvent';
import { ContentType } from '../domain/contenu/contentType';
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
    // FIXME : à supprimer PLUS D'IMPACT TODO
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
    // FIXME : à supprimer PLUS D'IMPACT TODO
  }

  private async processAccessProfile(utilisateurId: string) {
    // FIXME : à supprimer PLUS D'IMPACT TODO
  }

  private async processAccessCatalogueAides(utilisateurId: string) {
    //  FIXME : à supprimer PLUS D'IMPACT TODO
  }

  private async processServiceInstalled(
    utilisateurId: string,
    event: AppEvent,
  ) {
    //  FIXME : à supprimer PLUS D'IMPACT TODO
  }

  private async processLectureArticle(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.gamification, Scope.kyc],
    );

    await this.bibliothequeUsecase.external_read_article(
      event.content_id,
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processQuizzScore(utilisateurId: string, event: AppEvent) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides, Scope.gamification, Scope.kyc],
    );

    await this.bibliothequeUsecase.setQuizzResult(
      event.content_id,
      event.number_value,
      utilisateur,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
}
