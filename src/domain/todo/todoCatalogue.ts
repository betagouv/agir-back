import { Thematique } from '../thematique';
import { Todo } from './todo';

export class TodoCatalogue {
  private static catalogue: Todo[] = [
    {
      numero_todo: 1,
      points_todo: 25,
      done: [],
      todo: [
        {
          titre: 'Faire un premier quizz climat - facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 1 },
          sont_points_en_poche: false,
          type: 'quizz',
          content_id: null,
          points: 10,
        },
      ],
    },
    {
      numero_todo: 2,
      points_todo: 50,
      done: [],
      todo: [
        {
          titre: 'Faire 2 quizz climat - facile',
          thematiques: [Thematique.climat],
          progression: { current: 0, target: 2 },
          sont_points_en_poche: false,
          type: 'quizz',
          content_id: null,
          points: 10,
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
