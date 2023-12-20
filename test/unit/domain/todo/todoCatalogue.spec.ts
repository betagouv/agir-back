import { TodoCatalogue } from '../../../../src/domain/todo/todoCatalogue';

describe('TodoCatalogue', () => {
  it('getAllTodos : return all 6 todos', () => {
    // GIVEN
    // WHEN
    const result = TodoCatalogue.getAllTodos();

    // THEN
    expect(result).toHaveLength(5);
  });
});
