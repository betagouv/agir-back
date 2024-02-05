import { Thematique } from './thematique';
import { ContentType } from './contentType';

export class Recommandation {
  content_id: string;
  type: ContentType;
  titre: string;
  soustitre?: string;
  thematique_principale: Thematique;
  duree?: string;
  image_url: string;
  points: number;
}
