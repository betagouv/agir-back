import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';
import { TodoCatalogue } from './todoCatalogue';

export class TodoElementData {
  id: string;
  thematiques?: Thematique[];
  titre: string;
  type: InteractionType;
  level?: DifficultyLevel;
  content_id?: string;
  service_id?: string;
  interaction_id?: string;
  points: number;
  sont_points_en_poche: boolean;
  progression: { current: number; target: number };
  url?: string;
}

export class TodoElement extends TodoElementData {
  constructor(data: TodoElementData, parent: Todo) {
    super();
    Object.assign(this, data);
  }
  public isDone?() {
    return this.progression.current === this.progression.target;
  }
  public sontPointsEnPoche?(): boolean {
    return this.sont_points_en_poche;
  }
}

export class TodoData {
  numero_todo: number;
  points_todo: number;
  done_at: Date;
  titre: string;

  done: TodoElement[];
  todo: TodoElement[];
}

export class Todo extends TodoData {
  constructor(data: TodoData) {
    super();
    Object.assign(this, data);
    if (data.done_at) {
      this.done_at = new Date(data.done_at);
    }
    this.done = [];
    this.todo = [];
    if (data.done) {
      data.done.forEach((element) => {
        this.done.push(new TodoElement(element, this));
      });
    }
    if (data.todo) {
      data.todo.forEach((element) => {
        this.todo.push(new TodoElement(element, this));
      });
    }
  }

  public isDone?(): boolean {
    return this.todo.length === 0 && !this.hasPointsToEarn();
  }

  public empochePoints?(element: TodoElement): number {
    element.sont_points_en_poche = true;
    return element.points;
  }

  public hasPointsToEarn?(): boolean {
    return (
      this.done.findIndex(
        (element) =>
          element.progression.current === element.progression.target &&
          !element.sont_points_en_poche,
      ) >= 0
    );
  }
  public getNextTodo?() {
    return TodoCatalogue.getNewTodoOfNumero(this.numero_todo + 1);
  }
  public moveElementToDone?(element: TodoElement) {
    this.done.push(element);
    const index = this.todo.indexOf(element);
    this.todo.splice(index, 1);
  }

  public findTodoElementByTypeAndThematique?(
    type: InteractionType,
    thematiques?: Thematique[],
  ): TodoElement {
    return this.todo.find(
      (element) =>
        element.type === type &&
        this.includesAtLeastOneOf(element.thematiques, thematiques),
    );
  }

  public findDoneElementById?(elementId: string): TodoElement {
    return this.done.find((element) => element.id === elementId);
  }
  public findTodoElementByServiceId?(service_id: string): TodoElement {
    return this.todo.find((element) => element.service_id === service_id);
  }

  public makeProgress?(element: TodoElement) {
    element.progression.current++;
    if (element.progression.current === element.progression.target) {
      this.moveElementToDone(element);
    }
  }
  private includesAtLeastOneOf?(
    thematiquesElement: Thematique[],
    searchedThematiques?: Thematique[],
  ): boolean {
    if (searchedThematiques === undefined || searchedThematiques.length === 0) {
      return true;
    }
    for (let index = 0; index < searchedThematiques.length; index++) {
      const thematique = searchedThematiques[index];
      if (thematiquesElement.includes(thematique)) {
        return true;
      }
    }
    return false;
  }
}
