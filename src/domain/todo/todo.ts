import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ContentType } from '../contenu/contentType';
import { Thematique } from '../contenu/thematique';
import {
  TodoElement_v0,
  Todo_v0,
} from '../object_store/parcoursTodo/parcoursTodo_v0';
import { Celebration } from '../gamification/celebrations/celebration';

export class TodoElement {
  id: string;
  thematiques?: Thematique[];
  titre: string;
  type: ContentType;
  level?: DifficultyLevel;
  content_id?: string;
  service_id?: string;
  interaction_id?: string;
  points: number;
  sont_points_en_poche: boolean;
  progression: { current: number; target: number };
  url?: string;

  constructor(data: TodoElement_v0) {
    this.id = data.id;
    this.thematiques = data.thematiques;
    this.titre = data.titre;
    this.type = data.type;
    this.level = data.level;
    this.content_id = data.content_id;
    this.service_id = data.service_id;
    this.interaction_id = data.interaction_id;
    this.points = data.points;
    this.sont_points_en_poche = data.sont_points_en_poche;
    this.progression = data.progression;
    this.url = data.url;
  }
  public isDone?() {
    return this.progression.current === this.progression.target;
  }
  public sontPointsEnPoche?(): boolean {
    return this.sont_points_en_poche;
  }
}

export class Todo {
  numero_todo: number;
  points_todo: number;
  done_at: Date;
  titre: string;
  imageUrl: string;
  is_last?: boolean; // sans persistence

  done: TodoElement[];
  todo: TodoElement[];
  celebration: Celebration;

  constructor(data: Todo_v0) {
    this.numero_todo = data.numero_todo;
    this.points_todo = data.points_todo;
    this.titre = data.titre;
    this.imageUrl = data.imageUrl;

    if (data.celebration) {
      this.celebration = new Celebration(data.celebration);
    }
    if (data.done_at) {
      this.done_at = new Date(data.done_at);
    }

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
  public moveElementToDone?(element: TodoElement) {
    this.done.push(element);
    const index = this.todo.indexOf(element);
    this.todo.splice(index, 1);
  }

  public findTodoElementByTypeAndThematique?(
    type: ContentType,
    thematiques?: Thematique[],
  ): TodoElement {
    return this.todo.find(
      (element) =>
        element.type === type &&
        this.includesAtLeastOneOf(element.thematiques, thematiques),
    );
  }

  public findTodoKYCElementByQuestionID?(content_id: string): TodoElement {
    return this.todo.find(
      (element) =>
        element.type === ContentType.kyc && element.content_id === content_id,
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
