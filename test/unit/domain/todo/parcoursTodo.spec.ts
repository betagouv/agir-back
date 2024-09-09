import {
  LiveService,
  ScheduledService,
} from '../../../../src/domain/service/serviceDefinition';
import { ContentType } from '../../../../src/domain/contenu/contentType';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';
import { Todo } from '../../../../src/domain/todo/todo';
import { DifficultyLevel } from '../../../../src/domain/contenu/difficultyLevel';

describe('ParcoursTodo', () => {
  it('constructor : build ok init Parcours', () => {
    // GIVEN
    // WHEN
    const result = new ParcoursTodo();

    // THEN
    expect(result.todo_active).toEqual(0);
    expect(result.liste_todo).toHaveLength(TodoCatalogue.getNombreTodo());
  });
  it('getActiveTodo : renvoie la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const todo = parcours.getActiveTodo();
    // THEN
    expect(todo.numero_todo).toEqual(1);
  });
  it('findTodoElementByTypeAndThematique : le bon element et la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      version: 2,
      todo_active: 0,
      liste_todo: [
        {
          done: [],
          numero_todo: 1,
          points_todo: 20,
          done_at: null,
          titre: 'titre',
          imageUrl : 'http',
          celebration: null,
          todo: [
            {
              id: '1',
              points: 10,
              progression: { current: 0, target: 1 },
              level: DifficultyLevel.L1,
              titre: 'titre',
              type: ContentType.article,
              thematiques: [Thematique.transport],
              sont_points_en_poche: false,
            },
          ],
        },
      ],
    });
    // WHEN
    const found = parcours.findTodoElementByTypeAndThematique(
      ContentType.article,
      [Thematique.transport],
    );
    // THEN
    expect(found.element.titre).toEqual(`titre`);
    expect(found.todo.numero_todo).toEqual(1);
  });
  it('findTodoElementByTypeAndThematique : pas trouvé renvoi undefined', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByTypeAndThematique(
      ContentType.article,
      [Thematique.loisir],
    );
    // THEN
    expect(found).toBeUndefined();
  });
  it('findTodoElementByServiceId : le bon element et la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      version: 2,
      todo_active: 0,
      liste_todo: [
        {
          done: [],
          numero_todo: 1,
          points_todo: 20,
          done_at: null,
          celebration: null,
          titre: 'titre',
          imageUrl : 'http',
          todo: [
            {
              id: '1',
              points: 10,
              progression: { current: 0, target: 1 },
              level: DifficultyLevel.L1,
              titre: 'titre',
              type: ContentType.service,
              service_id: LiveService.fruits,
              thematiques: [Thematique.transport],
              sont_points_en_poche: false,
            },
          ],
        },
      ],
    });
    // WHEN
    const found = parcours.findTodoElementByServiceId(LiveService.fruits);
    // THEN
    expect(found.element.titre).toEqual(`titre`);
    expect(found.todo.numero_todo).toEqual(1);
  });
  it('findTodoElementByServiceId : pas trouvé renvoi undefined', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByServiceId(
      ScheduledService.dummy_scheduled,
    );
    // THEN
    expect(found).toBeUndefined();
  });
  it('avanceDansParcours : avance, puis se bloque à la dernière', () => {
    // GIVEN
    const parcours = new ParcoursTodo();

    // THEN
    let index = 1;
    while (index <= TodoCatalogue.getNombreTodo()) {
      expect(parcours.getCurrentTodoNumero()).toEqual(index);
      parcours.avanceDansParcours();
      index++;
    }
    expect(parcours.getCurrentTodoNumero()).toEqual(
      TodoCatalogue.getNombreTodo() + 1,
    );
    parcours.avanceDansParcours();
    expect(parcours.getCurrentTodoNumero()).toEqual(
      TodoCatalogue.getNombreTodo() + 1,
    );
  });
  it('appendNewFromCatalogue : ajoute une todo depuis le catalogue', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      version: 2,
      todo_active: 0,
      liste_todo: [
        {
          done: [],
          numero_todo: 1,
          points_todo: 20,
          done_at: null,
          celebration: null,
          titre: 'titre',
          imageUrl : 'http',
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
        },
      ],
    });
    // WHEN
    parcours.appendNewFromCatalogue();
    // THEN
    expect(parcours.liste_todo).toHaveLength(TodoCatalogue.getNombreTodo());
    expect(parcours.isEndedTodo()).toEqual(false);
  });
  it('isLast : quand position un cran au dela', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      version: 2,
      todo_active: 0,
      liste_todo: [
        {
          done: [],
          numero_todo: 1,
          points_todo: 20,
          done_at: null,
          celebration: null,
          titre: 'titre',
          imageUrl : 'http',
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
        },
      ],
    });
    // WHEN
    // THEN
    expect(parcours.isEndedTodo()).toEqual(false);
    parcours.avanceDansParcours();
    expect(parcours.isEndedTodo()).toEqual(true);
    parcours.avanceDansParcours();
    expect(parcours.isEndedTodo()).toEqual(true);
    expect(parcours.getCurrentTodoNumero()).toEqual(2);
  });
});
