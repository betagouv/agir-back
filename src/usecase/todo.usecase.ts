import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { Todo } from '../../src/domain/todo/todo';
import { TodoRepository } from '../../src/infrastructure/repository/todo.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { Interaction } from '../../src/domain/interaction/interaction';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';

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

  async gagnePointsFromTodoElement(utilisateurId: string, elementId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    const element = utilisateur.todo.findDoneElementById(elementId);
    if (element && !element.sont_points_en_poche) {
      element.sont_points_en_poche = true;
      utilisateur.points += element.points;
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getUtilisateurTodo(utilisateurId: string): Promise<Todo> {
    const todo = await this.todoRepository.getUtilisateurTodo(utilisateurId);
    for (let index = 0; index < todo.todo.length; index++) {
      const element = todo.todo[index];
      if (element.type === InteractionType.quizz) {
        const interaction =
          await this.interactionRepository.listInteractionIdProjectionByFilter({
            utilisateurId: utilisateurId,
            type: InteractionType.quizz,
            thematique_gamification: element.thematiques,
            difficulty: element.quizz_level,
          });
        if (interaction.length > 0) {
          const randomIteraction =
            interaction[Math.floor(Math.random() * interaction.length)];
          element.content_id = randomIteraction.content_id;
          element.interaction_id = randomIteraction.id;
        }
      }
    }
    return todo;
  }
}
