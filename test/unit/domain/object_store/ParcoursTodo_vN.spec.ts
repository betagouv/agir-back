import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { ParcoursTodo_v0 } from '../../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';

describe('ParcoursTodo vN ', () => {
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const todo = new ParcoursTodo();
    todo.getActiveTodo().done_at = new Date();
    todo.getActiveTodo().todo[0].interaction_id = '123';
    todo.getActiveTodo().todo[0].service_id = '456';

    // WHEN
    const raw = ParcoursTodo_v0.serialise(todo);
    const domain = new ParcoursTodo(raw);

    // THEN
    expect(todo).toStrictEqual(domain);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const todo = new ParcoursTodo();
    todo.getActiveTodo().done_at = new Date();
    todo.getActiveTodo().todo[0].interaction_id = '123';
    todo.getActiveTodo().todo[0].service_id = '456';

    // WHEN
    const raw = ParcoursTodo_v0.serialise(todo);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.ParcoursTodo);
    const domain = new ParcoursTodo(raw);

    // THEN
    expect(todo).toStrictEqual(domain);
  });
});
