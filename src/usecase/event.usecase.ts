import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { TodoRepository } from '../infrastructure/repository/todo.repository';
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
    private todoRepository: TodoRepository,
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private badgeRepository: BadgeRepository,
  ) {}

  async processEvent(utilisateurId: string, event: UtilisateurEvent) {
    switch (event.type) {
      case EventType.quizz_score:
        return await this.processQuizzScore(utilisateurId, event);
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

    await this.badgeRepository.createUniqueBadge(
      utilisateurId,
      BadgeTypes.premier_quizz,
    );

    if (event.number_value === 100) {
      this.addPoints(ctx);
    }

    ctx.interaction.updateStatus({
      done: true,
      quizz_score: event.number_value,
    });

    await this.interactionRepository.updateInteraction(ctx.interaction);

    await this.quizzLevelPromotion(ctx);
  }

  private async updateTodoIfNeeded({
    utilisateur,
    interaction,
  }: User_Interaction) {
    const matchingTodoElement = utilisateur.todo.findTodoElementLike(
      interaction.type,
      interaction.thematique_gamification,
    );
    if (!matchingTodoElement.isDone()) {
      matchingTodoElement.makeProgress();
    }
  }

  private async quizzLevelPromotion({
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

    await this.utilisateurRepository.updateQuizzProfile(
      utilisateur.id,
      utilisateur.quizzProfile,
    );
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

  private async addPoints({ utilisateur, interaction }: User_Interaction) {
    if (!interaction.done) {
      await this.utilisateurRepository.addPointsToUtilisateur(
        utilisateur.id,
        interaction.points,
      );
    }
  }
}
