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
import { BadgeRepository } from '../../src/infrastructure/repository/badge.repository';
import { BadgeTypes } from '../../src/domain/badge/badgeTypes';

export type User_Interaction = {
  utilisateur: Utilisateur;
  interaction: Interaction;
};

@Injectable()
export class EventUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private badgeRepository: BadgeRepository,
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
    }
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
    utilisateur.gamification.terminerCelebration(event.celebration_id);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private async processLectureArticle(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const ctx = await this.getUserAndInteraction(
      utilisateurId,
      event.interaction_id,
    );

    // FIXME : rustine car pas d'id interaction du front quand un lit un article hors todo/reco
    if (ctx.interaction) {
      const already_done = ctx.interaction.done;
      if (!already_done) {
        this.addPointsToUser(ctx);
      }
      this.updateUserTodo(ctx);
      await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
      ctx.interaction.updateStatus({
        done: true,
      });
      await this.interactionRepository.updateInteraction(ctx.interaction);
    }
  }

  private async processQuizzScore(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const ctx = await this.getUserAndInteraction(
      utilisateurId,
      event.interaction_id,
    );

    const already_done = ctx.interaction.done;

    await this.badgeRepository.createUniqueBadge(
      utilisateurId,
      BadgeTypes.premier_quizz,
    );

    ctx.interaction.updateStatus({
      done: true,
      quizz_score: event.number_value,
    });
    await this.interactionRepository.updateInteraction(ctx.interaction);

    if (event.number_value === 100) {
      this.addPointsToUser(ctx);
      this.updateUserTodo(ctx);
    }
    await this.promoteUserQuizzLevelIfNeeded(ctx);
    await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
  }

  private updateUserTodo({ utilisateur, interaction }: User_Interaction) {
    const matching =
      utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
        interaction.type,
        interaction.thematiques,
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
      await this.increaseQuizzLevel({ utilisateur, interaction });
    }
  }

  private async increaseQuizzLevel({
    utilisateur,
    interaction,
  }: User_Interaction) {
    utilisateur.quizzProfile.increaseLevel(interaction.thematique_gamification);

    await this.badgeRepository.createUniqueBadge(utilisateur.id, {
      titre: `Passage quizz niveau ${utilisateur.quizzProfile
        .getLevel(interaction.thematique_gamification)
        .toString()
        .at(-1)} en catégorie ${interaction.thematique_gamification} !!`,
      type: interaction.thematique_gamification.concat(
        '_',
        interaction.difficulty.toString(),
      ),
    });
  }

  private async getUserAndInteraction(
    utilisateurId: string,
    interactionId: string,
  ): Promise<User_Interaction> {
    const interaction = await this.interactionRepository.getInteractionById(
      interactionId,
    );
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return { utilisateur, interaction };
  }

  private addPointsToUser({ utilisateur, interaction }: User_Interaction) {
    utilisateur.gamification.ajoutePoints(interaction.points);
  }
}
