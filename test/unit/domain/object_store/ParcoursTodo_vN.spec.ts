import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { ParcoursTodo } from '../../../../src/domain/todo/parcoursTodo';
import { ParcoursTodo_v0 } from '../../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';

describe('ParcoursTodo vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.ParcoursTodo);

    // WHEN

    const domain = new ParcoursTodo(raw);
    // THEN

    expect(domain.isEndedTodo()).toEqual(true);
    expect(domain.todo_active).toEqual(0);
    expect(domain.liste_todo).toEqual([]);
    expect(domain.getActiveTodo().titre).toEqual(
      'Plus de mission, pour le moment...',
    );
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new ParcoursTodo();
    domain_start.getActiveTodo().done_at = new Date();
    domain_start.getActiveTodo().todo[0].interaction_id = '123';
    domain_start.getActiveTodo().todo[0].service_id = '456';

    // WHEN
    const raw = ParcoursTodo_v0.serialise(domain_start);
    const domain_end = new ParcoursTodo(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new ParcoursTodo();
    domain_start.getActiveTodo().done_at = new Date();
    domain_start.getActiveTodo().todo[0].interaction_id = '123';
    domain_start.getActiveTodo().todo[0].service_id = '456';

    // WHEN
    const raw = ParcoursTodo_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.ParcoursTodo);
    const domain_end = new ParcoursTodo(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
