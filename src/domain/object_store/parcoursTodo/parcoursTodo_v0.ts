import { Versioned } from '../versioned';
import { ParcoursTodo } from '../../todo/parcoursTodo';
import { Thematique } from '../../contenu/thematique';
import { ContentType } from '../../contenu/contentType';
import { DifficultyLevel } from '../../contenu/difficultyLevel';
import { Todo, TodoElement } from '../../todo/todo';

export class TodoElement_v0 {
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

  static map(todoElement: TodoElement): TodoElement_v0 {
    return {
      id: todoElement.id,
      thematiques: todoElement.thematiques,
      titre: todoElement.titre,
      type: todoElement.type,
      level: todoElement.level,
      content_id: todoElement.content_id,
      service_id: todoElement.service_id,
      interaction_id: todoElement.interaction_id,
      points: todoElement.points,
      sont_points_en_poche: todoElement.sont_points_en_poche,
      progression: todoElement.progression,
      url: todoElement.url,
    };
  }
}

export class Todo_v0 {
  numero_todo: number;
  points_todo: number;
  done_at: Date;
  titre: string;

  done: TodoElement_v0[];
  todo: TodoElement_v0[];

  static map(todo: Todo): Todo_v0 {
    return {
      numero_todo: todo.numero_todo,
      points_todo: todo.points_todo,
      done_at: todo.done_at,
      titre: todo.titre,
      done: todo.done.map((elem) => TodoElement_v0.map(elem)),
      todo: todo.todo.map((elem) => TodoElement_v0.map(elem)),
    };
  }
}

export class ParcoursTodo_v0 extends Versioned {
  liste_todo: Todo_v0[];
  todo_active: number;

  static serialise(domain: ParcoursTodo): ParcoursTodo_v0 {
    return {
      version: 0,
      todo_active: domain.todo_active,
      liste_todo: domain.liste_todo.map((elem) => Todo_v0.map(elem)),
    };
  }
}
