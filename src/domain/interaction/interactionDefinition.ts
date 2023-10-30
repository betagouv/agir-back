import { DifficultyLevel } from '../difficultyLevel';
import { Thematique } from '../thematique';
import { InteractionType } from './interactionType';

export class InteractionDefinitionData {
  id: string;
  type: InteractionType;
  content_id: string;
  titre: string;
  soustitre: string;
  thematique_gamification: Thematique;
  thematique_gamification_titre: string;
  thematiques: Thematique[];
  tags: string[];
  duree: string;
  frequence: string;
  image_url: string;
  url: string;
  difficulty: DifficultyLevel;
  points: number;
  locked: boolean;
  pinned_at_position: number;
  raison_lock: string;
  codes_postaux: string[];
  day_period: number;
  created_at: Date;
  updated_at: Date;
}

export class InteractionDefinition extends InteractionDefinitionData {
  constructor(data: InteractionDefinitionData) {
    super();
    Object.assign(this, data);
  }
}
