import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledService } from '../service/serviceDefinition';

export class TodoCatalogue {
  public static getNombreTodo(): number {
    return TodoCatalogue.catalogue.length;
  }

  public static getAllTodos(): Todo[] {
    const result: Todo[] = [];
    TodoCatalogue.catalogue.forEach((current_todo) => {
      result.push(new Todo(current_todo));
    });
    return result;
  }

  public static getNewTodoOfNumero(numero: number): Todo {
    return new Todo(
      TodoCatalogue.catalogue[
        Math.min(numero, TodoCatalogue.catalogue.length) - 1
      ],
    );
  }

  private static catalogue: Todo[] = [
    {
      numero_todo: 1,
      points_todo: 25,
      titre: "C'est parti pour la découverte du service Agir",
      done: [
        {
          id: uuidv4(),
          titre: `Faire le bilan simplifié de vos impacts`,
          thematiques: [],
          progression: { current: 1, target: 1 },
          sont_points_en_poche: false,
          type: InteractionType.onboarding,
          level: null,
          points: 10,
        },
      ],
      todo: [
        {
          id: uuidv4(),
          titre: 'Faire un premier quizz climat - facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: InteractionType.quizz,
          level: DifficultyLevel.ANY,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 25,
      titre: 'Des quiz, mais aussi des articles !',
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Faire 2 premier quizz logement - facile',
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: InteractionType.quizz,
          level: DifficultyLevel.ANY,
          points: 10,
        },
        {
          id: uuidv4(),
          titre: 'lire un premier article transport',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: InteractionType.article,
          level: DifficultyLevel.ANY,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 50,
      titre: 'Les services à VOTRE service',
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: `Lire 2 article sur l'alimentation`,
          thematiques: [Thematique.alimentation],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: InteractionType.article,
          level: DifficultyLevel.ANY,
          points: 20,
        },
        {
          id: uuidv4(),
          titre: 'Installer le service EcoWATT',
          thematiques: [Thematique.logement],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          service_id: ScheduledService.ecowatt,
          type: InteractionType.service,
          level: DifficultyLevel.ANY,
          points: 42,
        },
      ],
    },
    {
      numero_todo: 4,
      points_todo: 0,
      titre: 'Maintenant, vous êtes AU-TO-NOMES',
      done: [
        {
          id: uuidv4(),
          titre: 'Bravo, toutes les missions sont faites !!',
          thematiques: [],
          progression: { current: 1, target: 1 },
          sont_points_en_poche: true,
          type: InteractionType.onboarding,
          level: DifficultyLevel.ANY,
          points: 0,
        },
      ],
      todo: [],
    },
  ];
}
