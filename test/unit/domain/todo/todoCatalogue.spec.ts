import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';

describe('TodoCatalogue', () => {
  it('getNewTodoOfNumero : return ok 1st element ', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(1);

    // THEN
    expect(result.numero_todo).toEqual(1);
  });
  it('getNewTodoOfNumero : retourn todo vide finale quand todo pas identifié', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(34567);

    // THEN
    expect(result.titre).toEqual('Plus de mission, pour le moment...');
  });
  it('getNewTodoOfNumero : return 2nd element ', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(2);

    // THEN
    expect(result.numero_todo).toEqual(2);
  });
  it('getAllTodos : return all 6 todos', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getAllTodos();

    // THEN
    expect(result).toHaveLength(6);
  });
});
