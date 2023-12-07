import { ScheduledService } from '../../../../src/domain/service/serviceDefinition';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { Thematique } from '../../../../src/domain/thematique';
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
  it('findTodoElementByTypeAndThematique : le bon element et la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByTypeAndThematique(
      InteractionType.article,
      [Thematique.transport],
    );
    // THEN
    expect(found.element.titre).toEqual(`lire un premier article transport`);
    expect(found.todo.numero_todo).toEqual(2);
  });
  it('findTodoElementByTypeAndThematique : pas trouvé renvoi undefined', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByTypeAndThematique(
      InteractionType.article,
      [Thematique.loisir],
    );
    // THEN
    expect(found).toBeUndefined();
  });
  it('findTodoElementByServiceId : le bon element et la bonne todo', () => {
    // GIVEN
    const parcours = new ParcoursTodo();
    // WHEN
    const found = parcours.findTodoElementByServiceId(ScheduledService.ecowatt);
    // THEN
    expect(found.element.titre).toEqual(`Installer le service EcoWATT`);
    expect(found.todo.numero_todo).toEqual(3);
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
    expect(parcours.getCurrentTodoNumero()).toEqual(4);
  });
});
