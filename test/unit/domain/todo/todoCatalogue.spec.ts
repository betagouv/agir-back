import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';

describe('TodoCatalogue', () => {
  it('getNewTodoOfNumero : return ok 1st element ', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(1);

    // THEN
    expect(result.numero_todo).toEqual(1);
  });
  it('getNewTodoOfNumero : return 1st element if out of bound numbers', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(34567);

    // THEN
    expect(result.numero_todo).toEqual(1);
  });
  it('getNewTodoOfNumero : return 1st element number = zero', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(0);

    // THEN
    expect(result.numero_todo).toEqual(1);
  });
  it('getNewTodoOfNumero : return 2nd element ', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getNewTodoOfNumero(2);

    // THEN
    expect(result.numero_todo).toEqual(2);
  });
});
