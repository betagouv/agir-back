import { Injectable } from '@nestjs/common';
import { ContentType } from '../domain/contenu/contentType';
import { Todo } from '../../src/domain/todo/todo';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../infrastructure/applicationError';
import { ArticleRepository } from '../../src/infrastructure/repository/article.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';
import {
  Celebration,
  CelebrationType,
} from '../../src/domain/gamification/celebrations/celebration';
import { Categorie } from '../../src/domain/contenu/categorie';

@Injectable()
export class TodoUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async gagnerPointsFromTodoElement(utilisateurId: string, elementId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    const element = todo_active.findDoneElementById(elementId);

    if (element && !element.sontPointsEnPoche()) {
      const points = todo_active.empochePoints(element);
      utilisateur.gamification.ajoutePoints(points);
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async gagnerPointsFromTodo(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    if (todo_active.isDone()) {
      utilisateur.gamification.ajoutePoints(todo_active.points_todo);
      todo_active.done_at = new Date();
      utilisateur.parcours_todo.avanceDansParcours();

      if (utilisateur.parcours_todo.isLastTodo()) {
        utilisateur.gamification.celebrations.push(
          new Celebration({
            id: undefined,
            titre: 'Toutes les missions sont terminées !!',
            type: CelebrationType.fin_mission,
          }),
        );
      }
    } else {
      ApplicationError.throwUnfinishedTodoError();
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async getUtilisateurTodo(utilisateurId: string): Promise<Todo> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const todo = utilisateur.parcours_todo.getActiveTodo();

    for (let index = 0; index < todo.todo.length; index++) {
      const element = todo.todo[index];
      if (element.type === ContentType.quizz) {
        let quizzes = await this.quizzRepository.searchQuizzes({
          thematiques: element.thematiques,
          difficulty: element.level,
          exclude_ids: utilisateur.history.listeIdsQuizzAttempted(),
          categorie: Categorie.recommandation,
        });
        if (quizzes.length === 0) {
          quizzes = await this.quizzRepository.searchQuizzes({
            thematiques: element.thematiques,
            difficulty: element.level,
            exclude_ids: utilisateur.history.listeIdsQuizz100Pour100(),
            categorie: Categorie.recommandation,
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
          code_postal: utilisateur.logement.code_postal,
          categorie: Categorie.recommandation,
        });
        if (articles.length === 0) {
          articles = await this.articleRepository.searchArticles({
            thematiques: element.thematiques,
            difficulty: element.level,
            code_postal: utilisateur.logement.code_postal,
            categorie: Categorie.recommandation,
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

  public async updateAllUsersTodo(): Promise<string[]> {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    const log: string[] = [];
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];

      const utilisateur = await this.utilisateurRepository.getById(user_id);

      const evolved = utilisateur.parcours_todo.appendNewFromCatalogue();

      log.push(`utilisateur ${utilisateur.id} : ${evolved}`);

      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
    return log;
  }

  private randomFromArray(array: any[]): any {
    return array[Math.floor(Math.random() * array.length)];
  }
}
