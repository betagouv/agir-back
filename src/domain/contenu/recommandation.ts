import { ExplicationScore } from '../scoring/system_v2/ExplicationScore';
import { Thematique } from '../thematique/thematique';
import { ContentType } from './contentType';

export type Recommandation = {
  content_id: string;
  type: ContentType;
  titre: string;
  thematique_principale: Thematique;
  image_url: string;
  points: number;
  score: number;

  jours_restants?: number;
  soustitre?: string;
  duree?: string;
  isLocal: boolean;
  explicationScore: ExplicationScore;
};
