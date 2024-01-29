import {
  LiveService,
  ScheduledService,
} from '../../../../src/domain/service/serviceDefinition';
import { ContentType } from '../../../../src/domain/interaction/interactionType';
import { Thematique } from '../../../../src/domain/thematique';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';
import { Todo } from '../../../../src/domain/todo/todo';
import { DifficultyLevel } from '../../../../src/domain/difficultyLevel';

describe('ParcoursTodo', () => {
  it('constructor : build ok init Parcours', () => {
    // GIVEN
    // WHEN
    const result = new ParcoursTodo();

    // THEN
    expect(result.todo_active).toEqual(0);
    expect(result.liste_todo).toHaveLength(5);
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
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByTypeAndThematique(
      ContentType.article,
      [Thematique.transport],
    );
    // THEN
    expect(found.element.titre).toEqual(
      `Lire un article Transports - très facile`,
    );
    expect(found.todo.numero_todo).toEqual(2);
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
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByServiceId(LiveService.fruits);
    // THEN
    expect(found.element.titre).toEqual(
      `Installer "Fruits et légumes de saison"`,
    );
    expect(found.todo.numero_todo).toEqual(4);
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
    expect(parcours.getCurrentTodoNumero()).toEqual(1);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(2);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(3);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(4);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(5);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(6);
    // WHEN
    parcours.avanceDansParcours();
    // THEN
    expect(parcours.getCurrentTodoNumero()).toEqual(6);
  });
  it('appendNewFromCatalogue : ajoute une todo depuis le catalogue', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      todo_active: 0,
      liste_todo: [
        {
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
        },
      ],
    });
    // WHEN
    parcours.appendNewFromCatalogue();
    // THEN
    expect(parcours.liste_todo).toHaveLength(TodoCatalogue.getNombreTodo());
    expect(parcours.isLastTodo()).toEqual(false);
  });
  it('isLast : quand position un cran au dela', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      todo_active: 0,
      liste_todo: [
        {
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
        },
      ],
    });
    // WHEN
    // THEN
    expect(parcours.isLastTodo()).toEqual(false);
    parcours.avanceDansParcours();
    expect(parcours.isLastTodo()).toEqual(true);
    parcours.avanceDansParcours();
    expect(parcours.isLastTodo()).toEqual(true);
    expect(parcours.getCurrentTodoNumero()).toEqual(2);
  });
  it('upgradeParcoursIfNeeded : supprime elment end et fusionne', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      todo_active: 0,
      liste_todo: [
        {
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
        },
        {
          numero_todo: null,
          points_todo: 0,
          titre: 'Plus de mission, pour le moment...',
          done_at: null,
          done: [],
          todo: [],
          is_last: true,
        },
      ],
    });
    // WHEN
    parcours.upgradeParcoursIfNeeded();
    // THEN
    expect(parcours.liste_todo).toHaveLength(1);
  });
  it('upgradeParcoursIfNeeded : supprime rien si pas d element final', () => {
    // GIVEN
    const parcours = new ParcoursTodo({
      todo_active: 0,
      liste_todo: [
        {
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
        },
      ],
    });
    // WHEN
    parcours.upgradeParcoursIfNeeded();
    // THEN
    expect(parcours.liste_todo).toHaveLength(1);
  });
});
