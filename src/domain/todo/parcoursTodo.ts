import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';
import { Todo, TodoElement } from './todo';
import { TodoCatalogue } from './todoCatalogue';

export class ParcoursTodo {
  constructor(data?: ParcoursTodo) {
    this.liste_todo = [];
    if (data) {
      data.liste_todo.forEach((current_todo) => {
        this.liste_todo.push(new Todo(current_todo));
      });
      this.todo_active = data.todo_active;
    } else {
      this.liste_todo = TodoCatalogue.getAllTodos();
      this.todo_active = 0;
    }
  }
  liste_todo: Todo[];
  todo_active: number;

  public upgradeParcoursIfNeeded?() {
    const last_element = this.liste_todo[this.liste_todo.length - 1];
    if (last_element.titre === 'Plus de mission, pour le moment...') {
      this.liste_todo.pop();
    }
  }

  public getActiveTodo?(): Todo {
    if (this.todo_active < this.liste_todo.length) {
      return this.liste_todo[this.todo_active];
    }
    const result = TodoCatalogue.getEmptyLastMission();
    result.numero_todo = this.liste_todo.length + 1;
    return result;
  }

  public isLastTodo?(): boolean {
    return this.todo_active === this.liste_todo.length;
  }

  public appendNewFromCatalogue?() {
    const current_todo_length = this.liste_todo.length;
    const catalogue_length = TodoCatalogue.getNombreTodo();

    if (catalogue_length > current_todo_length) {
      for (
        let index = current_todo_length + 1;
        index <= catalogue_length;
        index++
      ) {
        this.liste_todo.push(TodoCatalogue.getTodoOfNumero(index));
      }
    }
  }

  public avanceDansParcours?() {
    this.todo_active = Math.min(this.todo_active + 1, this.liste_todo.length);
  }
  public getCurrentTodoNumero?(): number {
    return this.todo_active + 1;
  }
  public getTodoByNumero?(numero: number): Todo {
    if (numero <= this.liste_todo.length) {
      return this.liste_todo[numero - 1];
    }
    return TodoCatalogue.getEmptyLastMission();
  }
  public findTodoElementByTypeAndThematique?(
    type: InteractionType,
    thematiques?: Thematique[],
  ): { element: TodoElement; todo: Todo } {
    for (let index = 0; index < this.liste_todo.length; index++) {
      const current_todo = this.liste_todo[index];
      const found = current_todo.findTodoElementByTypeAndThematique(
        type,
        thematiques,
      );
      if (found) {
        return { element: found, todo: current_todo };
      }
    }
  }
  public findTodoKYCElementByQuestionID?(content_id: string): {
    element: TodoElement;
    todo: Todo;
  } {
    for (let index = 0; index < this.liste_todo.length; index++) {
      const current_todo = this.liste_todo[index];
      const found = current_todo.findTodoKYCElementByQuestionID(content_id);
      if (found) {
        return { element: found, todo: current_todo };
      }
    }
  }
  public findTodoElementByServiceId?(service_id: string): {
    element: TodoElement;
    todo: Todo;
  } {
    for (let index = 0; index < this.liste_todo.length; index++) {
      const current_todo = this.liste_todo[index];
      const found = current_todo.findTodoElementByServiceId(service_id);
      if (found) {
        return { element: found, todo: current_todo };
      }
    }
  }
}
