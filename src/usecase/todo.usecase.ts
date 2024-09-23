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
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { QuestionKYCUsecase } from './questionKYC.usecase';

@Injectable()
export class TodoUsecase {
  constructor(
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private quizzRepository: QuizzRepository,
    private kycRepository: KycRepository,
    private personnalisator: Personnalisator,
    private questionKYCUsecase: QuestionKYCUsecase,
  ) {}

  async gagnerPointsFromTodoElement(utilisateurId: string, elementId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    const element = todo_active.findDoneElementById(elementId);

    if (element && !element.sontPointsEnPoche()) {
      const points = todo_active.empochePoints(element);
      utilisateur.gamification.ajoutePoints(points, utilisateur);
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async gagnerPointsFromTodoTerminee(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const todo_active = utilisateur.parcours_todo.getActiveTodo();
    if (todo_active.isDone()) {
      utilisateur.gamification.ajoutePoints(
        todo_active.points_todo,
        utilisateur,
      );

      if (todo_active.celebration && todo_active.celebration.reveal) {
        const feature_to_reveal = todo_active.celebration.reveal.feature;
        utilisateur.unlocked_features.add(feature_to_reveal);
      }

      todo_active.done_at = new Date();
      utilisateur.parcours_todo.avanceDansParcours();

      if (utilisateur.parcours_todo.isEndedTodo()) {
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
      if (element.type === ContentType.quizz && !element.content_id) {
        let quizzes = await this.quizzRepository.searchQuizzes({
          thematiques: element.thematiques,
          difficulty: element.level,
          exclude_ids: utilisateur.history.listeIdsQuizzAttempted(),
          categorie: Categorie.recommandation,
          date: new Date(),
        });
        if (quizzes.length === 0) {
          quizzes = await this.quizzRepository.searchQuizzes({
            thematiques: element.thematiques,
            difficulty: element.level,
            exclude_ids: utilisateur.history.listeIdsQuizz100Pour100(),
            categorie: Categorie.recommandation,
            date: new Date(),
          });
        }
        if (quizzes.length > 0) {
          const randomQuizz = this.randomFromArray(quizzes);
          element.content_id = randomQuizz.content_id;
        }
      }
      if (element.type === ContentType.article && !element.content_id) {
        const articles_lus = utilisateur.history.searchArticlesIds({
          est_lu: true,
        });
        const code_commune = await this.communeRepository.getCodeCommune(
          utilisateur.logement.code_postal,
          utilisateur.logement.commune,
        );

        const dept_region =
          await this.communeRepository.findDepartementRegionByCodePostal(
            utilisateur.logement.code_postal,
          );

        // FIXME : centraliser la recherche articles
        let articles = await this.articleRepository.searchArticles({
          thematiques: element.thematiques,
          difficulty: element.level,
          exclude_ids: articles_lus,
          code_postal: utilisateur.logement.code_postal,
          categorie: Categorie.recommandation,
          date: new Date(),
          code_commune: code_commune ? code_commune : undefined,
          code_departement: dept_region
            ? dept_region.code_departement
            : undefined,
          code_region: dept_region ? dept_region.code_region : undefined,
        });
        if (articles.length === 0) {
          articles = await this.articleRepository.searchArticles({
            thematiques: element.thematiques,
            difficulty: element.level,
            code_postal: utilisateur.logement.code_postal,
            categorie: Categorie.recommandation,
            date: new Date(),
            code_commune: code_commune ? code_commune : undefined,
            code_departement: dept_region
              ? dept_region.code_departement
              : undefined,
            code_region: dept_region ? dept_region.code_region : undefined,
          });
        }
        if (articles.length > 0) {
          const randomArticle = this.randomFromArray(articles);
          element.content_id = randomArticle.content_id;
        }
      }
      if (element.type === ContentType.enchainement_kyc) {
        const enchainement =
          await this.questionKYCUsecase.getEnchainementQuestions(
            utilisateurId,
            element.content_id,
          );

        const progression = enchainement.getProgression();
        element.progression = progression;

        if (progression.current === progression.target) {
          todo.moveElementToDone(element);
          const tmp_user = await this.utilisateurRepository.getById(
            utilisateurId,
          );
          const new_elem = tmp_user.parcours_todo.findTodoElementByID(
            element.id,
          );
          if (new_elem) {
            new_elem.element.progression = progression;
            new_elem.todo.moveElementToDone(new_elem.element);
          }
          await this.utilisateurRepository.updateUtilisateur(tmp_user);
        }
      }
    }

    //return todo;
    return this.personnalisator.personnaliser(todo, utilisateur);
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
