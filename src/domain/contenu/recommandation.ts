import { Thematique } from '../thematique/thematique';
import { ContentType } from './contentType';
import { DefiStatus } from '../defis/defi';

export type Recommandation = {
  content_id: string;
  type: ContentType;
  titre: string;
  thematique_principale: Thematique;
  image_url: string;
  points: number;
  score: number;

  jours_restants?: number;
  status_defi?: DefiStatus;
  soustitre?: string;
  duree?: string;
};
