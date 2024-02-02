import { DifficultyLevel } from './difficultyLevel';
import { Thematique } from './thematique';

export class Article {
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
  thematique_principale: Thematique;
  thematiques: Thematique[];
}

export class PersonalArticle extends Article {
  favoris: boolean;
  read_date?: Date;
  like_level?: number;
}
