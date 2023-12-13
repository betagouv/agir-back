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

  public getActiveTodo?(): Todo {
    return this.liste_todo[this.todo_active];
  }

  public avanceDansParcours?() {
    this.todo_active = Math.min(
      this.todo_active + 1,
      this.liste_todo.length - 1,
    );
  }
  public getCurrentTodoNumero?(): number {
    return this.liste_todo[this.todo_active].numero_todo;
  }
  public getTodoByNumero(numero: number): Todo {
    return this.liste_todo[numero - 1];
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
