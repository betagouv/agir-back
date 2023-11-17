import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from '../interaction/interactionType';
import { Thematique } from '../thematique';

export class TodoElement {
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
