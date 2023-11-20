import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';

export class TodoElementData {
  thematiques: Thematique[];
  titre: string;
  type: InteractionType;
  quizz_level: DifficultyLevel;
  content_id?: string;
  interaction_id?: string;
  points: number;
  sont_points_en_poche: boolean;
  progression: { current: number; target: number };
}

export class TodoElement extends TodoElementData {
  constructor(data: TodoElementData) {
    super();
    Object.assign(this, data);
  }
  public isDone?() {
    return this.progression.current === this.progression.target;
  }

  public makeProgress?() {
    this.progression.current++;
  }
}

export class TodoData {
  numero_todo: number;
  points_todo: number;

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
        this.done.push(new TodoElement(element));
      });
    }
    if (data.todo) {
      data.todo.forEach((element) => {
        this.todo.push(new TodoElement(element));
      });
    }
  }

  public findTodoElementLike?(
    type: InteractionType,
    thematique: Thematique,
  ): TodoElement {
    return this.todo.find(
      (element) =>
        element.type === type && element.thematiques.includes(thematique),
    );
  }
}
