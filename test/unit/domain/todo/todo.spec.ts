import { Thematique } from '../../../../src/domain/thematique';
import { DifficultyLevel } from '../../../../src/domain/difficultyLevel';
import { Todo } from '../../../../src/domain/todo/todo';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';

describe('Todo', () => {
  it('findTodoElementLike : retourne element de todo qui mach ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    // WHEN
    const result = todo.findTodoElementByTypeAndThematique(
      InteractionType.quizz,
      Thematique.logement,
    );

    // THEN
    expect(result.id).toEqual('2');
  });
  it('moveElementToDone : bouge un element de todo à done ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    const element = todo.findTodoElementByTypeAndThematique(
      InteractionType.quizz,
      Thematique.logement,
    );
    // WHEN
    todo.moveElementToDone(element);

    // THEN
    expect(todo.done).toHaveLength(1);
    expect(todo.done[0].id).toEqual('2');
  });
  it('makeProgress : bouge l element au bout de 2 fois ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 2 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: InteractionType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    const element = todo.findTodoElementByTypeAndThematique(
      InteractionType.quizz,
      Thematique.logement,
    );
    // WHEN
    todo.makeProgress(element);

    // THEN
    expect(todo.done).toHaveLength(0);

    // WHEN
    todo.makeProgress(element);

    // THEN
    expect(todo.done).toHaveLength(1);
  });
});
