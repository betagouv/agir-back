import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { Todo } from '../../src/domain/todo/todo';
import { TodoRepository } from '../../src/infrastructure/repository/todo.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import {
  Interaction,
  InteractionIdProjection,
} from '../../src/domain/interaction/interaction';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../infrastructure/applicationError';

export type User_Interaction = {
  utilisateur: Utilisateur;
  interaction: Interaction;
};

@Injectable()
export class TodoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private todoRepository: TodoRepository,
    private interactionRepository: InteractionRepository,
  ) {}

  async gagnerPointsFromTodoElement(utilisateurId: string, elementId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const element = utilisateur.parcours_todo
      .getActiveTodo()
      .findDoneElementById(elementId);

    if (element && !element.sont_points_en_poche) {
      element.sont_points_en_poche = true;
      utilisateur.gamification.ajoutePoints(element.points);
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async gagnerPointsFromTodo(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur.parcours_todo.getActiveTodo().isDone()) {
      utilisateur.gamification.ajoutePoints(
        utilisateur.parcours_todo.getActiveTodo().points_todo,
      );
      utilisateur.parcours_todo.avanceDansParcours();
    } else {
      ApplicationError.throwUnfinishedTodoError();
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getUtilisateurTodo(utilisateurId: string): Promise<Todo> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    const todo = utilisateur.parcours_todo.getActiveTodo();

    for (let index = 0; index < todo.todo.length; index++) {
      const element = todo.todo[index];
      let interactions: InteractionIdProjection[] = [];
      if (element.type === InteractionType.quizz) {
        interactions =
          await this.interactionRepository.listInteractionIdProjectionByFilter({
            utilisateurId: utilisateurId,
            type: element.type,
            thematiques: element.thematiques,
            difficulty: element.level,
            done: false,
          });
        if (interactions.length === 0) {
          interactions =
            await this.interactionRepository.listInteractionIdProjectionByFilter(
              {
                utilisateurId: utilisateurId,
                type: element.type,
                thematiques: element.thematiques,
                difficulty: element.level,
                done: true,
                quizz_full_success: false,
              },
            );
        }
      }
      if (element.type === InteractionType.article) {
        interactions =
          await this.interactionRepository.listInteractionIdProjectionByFilter({
            utilisateurId: utilisateurId,
            type: element.type,
            thematiques: element.thematiques,
            difficulty: element.level,
            done: false,
          });
        if (interactions.length === 0) {
          interactions =
            await this.interactionRepository.listInteractionIdProjectionByFilter(
              {
                utilisateurId: utilisateurId,
                type: element.type,
                thematiques: element.thematiques,
                difficulty: element.level,
                done: true,
              },
            );
        }
      }
      if (interactions.length > 0) {
        const randomIteraction =
          interactions[Math.floor(Math.random() * interactions.length)];
        element.content_id = randomIteraction.content_id;
        element.interaction_id = randomIteraction.id;
      }
    }
    return todo;
  }
}
