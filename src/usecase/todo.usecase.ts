import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../../src/infrastructure/repository/interaction.repository';
import { InteractionType } from '../../src/domain/interaction/interactionType';
import { Todo } from '../../src/domain/todo/todo';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import {
  Interaction,
  InteractionIdProjection,
} from '../../src/domain/interaction/interaction';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../infrastructure/applicationError';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';

export type User_Interaction = {
  utilisateur: Utilisateur;
  interaction: Interaction;
};

@Injectable()
export class TodoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private interactionRepository: InteractionRepository,
    private articleRepository: ArticleRepository,
  ) {}

  async gagnerPointsFromTodoElement(utilisateurId: string, elementId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    await this.upgradeTodoIfNeeded(utilisateur);

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    const element = todo_active.findDoneElementById(elementId);

    if (element && !element.sontPointsEnPoche()) {
      const points = todo_active.empochePoints(element);
      utilisateur.gamification.ajoutePoints(points);
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async gagnerPointsFromTodo(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    await this.upgradeTodoIfNeeded(utilisateur);

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    if (todo_active.isDone()) {
      utilisateur.gamification.ajoutePoints(todo_active.points_todo);
      todo_active.done_at = new Date();
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

    await this.upgradeTodoIfNeeded(utilisateur);

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
        if (interactions.length > 0) {
          const randomIteraction = this.randomFromArray(interactions);
          element.content_id = randomIteraction.content_id;
          element.interaction_id = randomIteraction.id;
        }
      }
      if (element.type === InteractionType.article) {
        if (utilisateur.does_get_articles_from_articlerepo()) {
          const articles_lus = utilisateur.history.listeIdsArticlesLus();
          let articles = await this.articleRepository.searchArticles({
            thematiques: element.thematiques,
            difficulty: element.level,
            exclude_ids: articles_lus,
          });
          if (articles.length === 0) {
            articles = await this.articleRepository.searchArticles({
              thematiques: element.thematiques,
              difficulty: element.level,
            });
          }
          if (articles.length > 0) {
            const randomArticle = this.randomFromArray(articles);
            element.content_id = randomArticle.content_id;
          }
        } else {
          interactions =
            await this.interactionRepository.listInteractionIdProjectionByFilter(
              {
                utilisateurId: utilisateurId,
                type: element.type,
                thematiques: element.thematiques,
                difficulty: element.level,
                done: false,
              },
            );
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
          if (interactions.length > 0) {
            const randomIteraction = this.randomFromArray(interactions);
            element.content_id = randomIteraction.content_id;
            element.interaction_id = randomIteraction.id;
          }
        }
      }
    }
    return todo;
  }
  private async upgradeTodoIfNeeded(utilisateur: Utilisateur) {
    utilisateur.parcours_todo.upgradeParcoursIfNeeded();
    utilisateur.parcours_todo.appendNewFromCatalogue();
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private randomFromArray(array: any[]): any {
    return array[Math.floor(Math.random() * array.length)];
  }
}
