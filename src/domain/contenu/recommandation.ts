import { Thematique } from './thematique';
import { ContentType } from './contentType';

export class Recommandation {
  content_id: string;
  type: ContentType;
  titre: string;
  thematique_principale: Thematique;
  image_url: string;
  points: number;
  score: number;

  soustitre?: string;
  duree?: string;
}
