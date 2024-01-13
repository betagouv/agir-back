import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import {
  EventType,
  UtilisateurEvent,
} from '../../src/domain/utilisateur/utilisateurEvent';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { Interaction } from '../../src/domain/interaction/interaction';
import { QuizzLevelSettings } from '../../src/domain/quizz/quizzLevelSettings';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { Thematique } from '../../src/domain/thematique';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';

export type User_Interaction = {
  utilisateur: Utilisateur;
  interaction: Interaction;
};

@Injectable()
export class EventUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async processEvent(utilisateurId: string, event: UtilisateurEvent) {
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
    }
  }

  private async processLike(utilisateurId: string, event: UtilisateurEvent) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur.does_get_article_quizz_from_repo()) {
      if (event.content_type === InteractionType.article) {
        utilisateur.history.likerArticle(event.content_id, event.number_value);
        await this.utilisateurRepository.updateUtilisateur(utilisateur);
      }
      if (event.content_type === InteractionType.quizz) {
        utilisateur.history.likerQuizz(event.content_id, event.number_value);
        await this.utilisateurRepository.updateUtilisateur(utilisateur);
      }
    } else {
      const interaction =
        await this.interactionRepository.getInteractionOfUserByTypeAndContentId(
          utilisateurId,
          event.content_type,
          event.content_id,
        );
      interaction.like_level = event.number_value;
      await this.interactionRepository.updateInteraction(interaction);
    }
  }

  private async processAccessRecommandations(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      InteractionType.recommandations,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessProfile(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      InteractionType.profile,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processAccessCatalogueAides(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const found = utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
      InteractionType.aides,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processServiceInstalled(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const found = utilisateur.parcours_todo.findTodoElementByServiceId(
      event.service_id,
    );
    if (found) {
      found.todo.makeProgress(found.element);
    }

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processCelebration(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    utilisateur.gamification.terminerCelebration(
      event.celebration_id,
      utilisateur,
    );
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLectureArticle(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur.does_get_article_quizz_from_repo()) {
      utilisateur.history.articleLu(event.content_id);
      const article = await this.articleRepository.getArticleByContentId(
        event.content_id,
      );
      if (!utilisateur.history.sontPointsArticleEnPoche(event.content_id)) {
        utilisateur.gamification.ajoutePoints(article.points);
        utilisateur.history.metPointsArticleEnPoche(event.content_id);
      }
      this.updateUserTodo(
        utilisateur,
        InteractionType.article,
        article.thematiques,
      );
    } else {
      const interaction =
        await this.interactionRepository.getInteractionOfUserByTypeAndContentId(
          utilisateurId,
          InteractionType.article,
          event.content_id,
        );
      if (!interaction.points_en_poche) {
        utilisateur.gamification.ajoutePoints(interaction.points);
        interaction.points_en_poche = true;
      }
      interaction.updateStatus({
        done: true,
      });
      await this.interactionRepository.updateInteraction(interaction);
      this.updateUserTodo(
        utilisateur,
        InteractionType.article,
        interaction.thematiques,
      );
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processQuizzScore(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur.does_get_article_quizz_from_repo()) {
      utilisateur.history.quizzAttempt(event.content_id, event.number_value);

      const quizz = await this.quizzRepository.getQuizzByContentId(
        event.content_id,
      );
      if (
        !utilisateur.history.sontPointsQuizzEnPoche(event.content_id) &&
        event.number_value === 100
      ) {
        utilisateur.gamification.ajoutePoints(quizz.points);
        utilisateur.history.metPointsQuizzEnPoche(event.content_id);
        this.updateUserTodo(
          utilisateur,
          InteractionType.quizz,
          quizz.thematiques,
        );
      }
    } else {
      const interaction =
        await this.interactionRepository.getInteractionOfUserByTypeAndContentId(
          utilisateurId,
          InteractionType.quizz,
          event.content_id,
        );
      interaction.updateStatus({
        done: true,
        quizz_score: event.number_value,
      });

      if (!interaction.points_en_poche && event.number_value === 100) {
        utilisateur.gamification.ajoutePoints(interaction.points);
        interaction.points_en_poche = true;
        this.updateUserTodo(
          utilisateur,
          InteractionType.quizz,
          interaction.thematiques,
        );
      }
      await this.interactionRepository.updateInteraction(interaction);
      // FIXME : à répliquer dans le NEW MODEL
      await this.promoteUserQuizzLevelIfNeeded({ utilisateur, interaction });
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private updateUserTodo(
    utilisateur: Utilisateur,
    type: InteractionType,
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

  private async promoteUserQuizzLevelIfNeeded({
    utilisateur,
    interaction,
  }: User_Interaction) {
    const doneQuizz =
      await this.interactionRepository.listDoneQuizzByCategorieAndDifficulty(
        utilisateur.id,
        interaction.thematique_gamification,
        interaction.difficulty,
      );

    const isLevelCompleted = QuizzLevelSettings.isLevelCompleted(
      interaction.difficulty,
      doneQuizz,
    );

    if (isLevelCompleted) {
      utilisateur.quizzProfile.increaseLevel(
        interaction.thematique_gamification,
      );
    }
  }
}
