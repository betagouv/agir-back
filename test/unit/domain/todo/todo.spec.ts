import { Thematique } from '../../../../src/domain/contenu/thematique';
import { DifficultyLevel } from '../../../../src/domain/contenu/difficultyLevel';
import { Todo } from '../../../../src/domain/todo/todo';
import { ContentType } from '../../../../src/domain/contenu/contentType';

describe('Todo', () => {
  it('findTodoElementLike : retourne element de todo qui mach ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      done_at: null,
      titre: 'titre',
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    // WHEN
    const result = todo.findTodoElementByTypeAndThematique(
      ContentType.quizz,
      [Thematique.logement],
    );

    // THEN
    expect(result.id).toEqual('2');
  });
  it('findTodoElementLike : retourne element de todo qui mach sans thematique ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      done_at: null,
      titre: 'titre',
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          titre: 'titre',
          type: ContentType.aides,
          sont_points_en_poche: false,
        },
      ],
    });
    // WHEN
    const result = todo.findTodoElementByTypeAndThematique(
      ContentType.aides,
    );

    // THEN
    expect(result.id).toEqual('1');
  });
  it('findTodoElementLike : retourne element de todo qui mach avec thematique mais recherche optionnelle', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      done_at: null,
      titre: 'titre',
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          titre: 'titre',
          thematiques: [Thematique.climat],
          type: ContentType.aides,
          sont_points_en_poche: false,
        },
      ],
    });
    // WHEN
    const result = todo.findTodoElementByTypeAndThematique(
      ContentType.aides,
    );

    // THEN
    expect(result.id).toEqual('1');
  });
  it('moveElementToDone : bouge un element de todo à done ', () => {
    // GIVEN
    const todo = new Todo({
      done: [],
      numero_todo: 1,
      points_todo: 20,
      titre: 'titre',
      done_at: null,
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    const element = todo.findTodoElementByTypeAndThematique(
      ContentType.quizz,
      [Thematique.logement],
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
      titre: 'titre',
      done_at: null,
      todo: [
        {
          id: '1',
          points: 10,
          progression: { current: 0, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 0, target: 2 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    const element = todo.findTodoElementByTypeAndThematique(
      ContentType.quizz,
      [Thematique.logement],
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
  it('isDone : true quand une todo est vide et tous les points récoltés ', () => {
    // GIVEN
    const todo = new Todo({
      todo: [],
      numero_todo: 1,
      points_todo: 20,
      titre: 'titre',
      done_at: null,
      done: [
        {
          id: '1',
          points: 10,
          progression: { current: 1, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: true,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 2, target: 2 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: true,
        },
      ],
    });
    // WHEN
    const done = todo.isDone();

    // THEN
    expect(done).toEqual(true);
  });
  it('isDone : false quand une todo est vide et encore des points à récolter', () => {
    // GIVEN
    const todo = new Todo({
      todo: [],
      numero_todo: 1,
      points_todo: 20,
      titre: 'titre',
      done_at: null,
      done: [
        {
          id: '1',
          points: 10,
          progression: { current: 1, target: 1 },
          level: DifficultyLevel.L1,
          thematiques: [Thematique.climat],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: true,
        },
        {
          id: '2',
          points: 20,
          progression: { current: 2, target: 2 },
          level: DifficultyLevel.L2,
          thematiques: [Thematique.logement],
          titre: 'titre',
          type: ContentType.quizz,
          sont_points_en_poche: false,
        },
      ],
    });
    // WHEN
    const done = todo.isDone();

    // THEN
    expect(done).toEqual(false);
  });
});
