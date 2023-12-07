import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';

describe('ParcoursTodo', () => {
  it('constructor : build ok init Parcours', () => {
    // GIVEN
    // WHEN
    const result = new ParcoursTodo();

    // THEN
    expect(result.todo_active).toEqual(0);
    expect(result.liste_todo).toHaveLength(4);
  });
  it('getActiveTodo : renvoie la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const todo = parcours.getActiveTodo();
    // THEN
    expect(todo.numero_todo).toEqual(1);
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
    expect(parcours.getCurrentTodoNumero()).toEqual(4);
  });
});
