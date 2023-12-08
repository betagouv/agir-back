import { DifficultyLevel } from '../difficultyLevel';
import { RevealType } from '../gamification/celebrations/reveal';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';
import { TodoCatalogue } from './todoCatalogue';

export class TodoElementData {
  id: string;
  thematiques: Thematique[];
  titre: string;
  type: InteractionType;
  level?: DifficultyLevel;
  content_id?: string;
  service_id?: string;
  interaction_id?: string;
  points: number;
  sont_points_en_poche: boolean;
  reveal?: RevealType;
  progression: { current: number; target: number };
}

export class TodoElement extends TodoElementData {
  constructor(data: TodoElementData, parent: Todo) {
    super();
    Object.assign(this, data);
  }
  public isDone?() {
    return this.progression.current === this.progression.target;
  }
}

export class TodoData {
  numero_todo: number;
  points_todo: number;
  titre: string;

  done: TodoElement[];
  todo: TodoElement[];
}

export class Todo extends TodoData {
  constructor(data: TodoData) {
    super();
    Object.assign(this, data);
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
    thematiques: Thematique[],
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
    list1: Thematique[],
    list2: Thematique[],
  ): boolean {
    for (let index = 0; index < list2.length; index++) {
      const e2 = list2[index];
      if (list1.includes(e2)) {
        return true;
      }
    }
    return false;
  }
}
