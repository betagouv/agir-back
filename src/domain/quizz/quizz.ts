import { Thematique } from '../contenu/thematique';

export class Quizz {
  constructor(data: Quizz) {
    Object.assign(this, data);
    if (!this.score) {
      this.score = 0;
    }
  }
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
  difficulty: number;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  tags: string[];
  score: number;
}
