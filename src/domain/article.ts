import { DifficultyLevel } from './difficultyLevel';
import { Thematique } from './thematique';

export type Article = {
  content_id: string;
  titre: string;
  soustitre?: string;
  source?: string;
  image_url: string;
  partenaire?: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree?: string;
  frequence?: string;
  difficulty: DifficultyLevel;
  points: number;
  thematique_gamification?: Thematique;
  thematiques: Thematique[];
};
