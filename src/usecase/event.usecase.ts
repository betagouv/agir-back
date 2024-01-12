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
import { InteractionType } from '../../src/domain/interaction/interactionType';

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
    const ctx = await this.getUserAndInteraction(
      utilisateurId,
      event,
      event.content_type,
    );

    ctx.interaction.like_level = event.number_value;

    await this.interactionRepository.updateInteraction(ctx.interaction);

    // NEW MODEL
    if (event.content_type === InteractionType.article) {
      ctx.utilisateur.history.likerArticle(
        event.content_id,
        event.number_value,
      );
      await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
    }
    // NEW MODEL
    if (event.content_type === InteractionType.quizz) {
      ctx.utilisateur.history.likerQuizz(event.content_id, event.number_value);
      await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
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
    const ctx = await this.getUserAndInteraction(
      utilisateurId,
      event,
      InteractionType.article,
    );

    if (
      !ctx.interaction.points_en_poche &&
      !ctx.utilisateur.history.sontPointsArticleEnPoche(
        ctx.interaction.content_id,
      )
    ) {
      this.addPointsToUser(ctx.utilisateur, ctx.interaction.points);
      ctx.interaction.points_en_poche = true;

      // NEW MODEL
      ctx.utilisateur.history.metPointsArticleEnPoche(
        ctx.interaction.content_id,
      );
    }

    // NEW MODEL
    ctx.utilisateur.history.articleLu(
      event.content_id || ctx.interaction.content_id,
    );

    this.updateUserTodo(ctx);
    await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
    ctx.interaction.updateStatus({
      done: true,
    });
    await this.interactionRepository.updateInteraction(ctx.interaction);
  }

  private async processQuizzScore(
    utilisateurId: string,
    event: UtilisateurEvent,
  ) {
    const ctx = await this.getUserAndInteraction(
      utilisateurId,
      event,
      InteractionType.quizz,
    );

    await this.badgeRepository.createUniqueBadge(
      utilisateurId,
      BadgeTypes.premier_quizz,
    );

    ctx.interaction.updateStatus({
      done: true,
      quizz_score: event.number_value,
    });

    // NEW MODEL
    ctx.utilisateur.history.quizzAttempt(
      ctx.interaction.content_id,
      event.number_value,
    );

    if (event.number_value === 100) {
      if (
        !ctx.interaction.points_en_poche &&
        !ctx.utilisateur.history.sontPointsQuizzEnPoche(
          ctx.interaction.content_id,
        )
      ) {
        this.addPointsToUser(ctx.utilisateur, ctx.interaction.points);
        ctx.interaction.points_en_poche = true;
        // NEW MODEL
        ctx.utilisateur.history.metPointsQuizzEnPoche(
          ctx.interaction.content_id,
        );
      }
      this.updateUserTodo(ctx);
    }
    await this.interactionRepository.updateInteraction(ctx.interaction);
    await this.promoteUserQuizzLevelIfNeeded(ctx);
    await this.utilisateurRepository.updateUtilisateur(ctx.utilisateur);
  }

  private updateUserTodo({ utilisateur, interaction }: User_Interaction) {
    console.log(`interaction.type ${interaction.type}`);
    console.log(`interaction.thematiques ${interaction.thematiques}`);
    console.log(`content_id ${interaction.content_id}`);
    const matching =
      utilisateur.parcours_todo.findTodoElementByTypeAndThematique(
        interaction.type,
        interaction.thematiques,
      );
    console.log(matching);
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
    event: UtilisateurEvent,
    type_interaction: InteractionType,
  ): Promise<User_Interaction> {
    const interaction =
      await this.interactionRepository.getInteractionOfUserByTypeAndContentId(
        utilisateurId,
        type_interaction,
        event.content_id,
      );
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return { utilisateur, interaction };
  }

  private addPointsToUser(utilisateur: Utilisateur, points: number) {
    utilisateur.gamification.ajoutePoints(points);
  }
}
