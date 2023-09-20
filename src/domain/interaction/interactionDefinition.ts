import { DifficultyLevel } from '../difficultyLevel';
import { InteractionType } from './interactionType';

export class InteractionDefinition {
  constructor(data: object) {
    Object.assign(this, data);
  }
  id: string;
  content_id?: string;
  type: InteractionType;
  titre: string;
  soustitre?: string;
  categorie: string;
  tags: [];
  duree?: string;
  frequence?: string;
  image_url: string;
  url?: string;
  difficulty: DifficultyLevel;
  points: number;
  score: number;
  locked: boolean;
  pinned_at_position: number;
  raison_lock: string;
  codes_postaux: string[];
  day_period: number;
  created_at?: Date;
  updated_at?: Date;
}
