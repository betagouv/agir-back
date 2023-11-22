import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';
import { Todo } from './todo';
import { v4 as uuidv4 } from 'uuid';

export class TodoCatalogue {
  private static catalogue: Todo[] = [
    {
      numero_todo: 1,
      points_todo: 25,
      done: [
        {
          id: uuidv4(),
          titre: `Faire l'onboarding !`,
          thematiques: [],
          progression: { current: 1, target: 1 },
          sont_points_en_poche: false,
          type: InteractionType.onboarding,
          quizz_level: null,
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
          quizz_level: DifficultyLevel.L1,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 25,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Faire 2 premier quizz climat - facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: InteractionType.quizz,
          quizz_level: DifficultyLevel.L1,
          points: 10,
        },
        {
          id: uuidv4(),
          titre: 'lire un premier article transport',
          thematiques: [Thematique.transport],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: InteractionType.article,
          quizz_level: DifficultyLevel.L1,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 3,
      points_todo: 50,
      done: [],
      todo: [
        {
          id: uuidv4(),
          titre: 'Faire 2 quizz climat - niveau moyens',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: InteractionType.quizz,
          quizz_level: DifficultyLevel.L2,
          points: 20,
        },
      ],
    },
  ];

  public static getNewTodoOfNumero(numero: number): Todo {
    return (
      TodoCatalogue.catalogue[numero - 1] || TodoCatalogue.getNewTodoOfNumero(1)
    );
  }
}
