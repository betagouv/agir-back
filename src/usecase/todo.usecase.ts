import { Injectable } from '@nestjs/common';
import { ContentType } from '../domain/contenu/contentType';
import { Todo } from '../../src/domain/todo/todo';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../infrastructure/applicationError';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';

@Injectable()
export class TodoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
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
      if (element.type === ContentType.quizz) {
        let quizzes = await this.quizzRepository.searchQuizzes({
          thematiques: element.thematiques,
          difficulty: element.level,
          exclude_ids: utilisateur.history.listeIdsQuizzAttempted(),
        });
        if (quizzes.length === 0) {
          quizzes = await this.quizzRepository.searchQuizzes({
            thematiques: element.thematiques,
            difficulty: element.level,
            exclude_ids: utilisateur.history.listeIdsQuizz100Pour100(),
          });
        }
        if (quizzes.length > 0) {
          const randomQuizz = this.randomFromArray(quizzes);
          element.content_id = randomQuizz.content_id;
        }
      }
      if (element.type === ContentType.article) {
        const articles_lus = utilisateur.history.searchArticlesIds({
          est_lu: true,
        });
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
