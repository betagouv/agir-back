import { Thematique } from '../thematique';

export class TodoElement {
  thematiques: Thematique[];
  titre: string;
  type: string;
  content_id: string;
  points: number;
  sont_points_en_poche: boolean;
  progression: { current: number; target: number };
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
  }
}
