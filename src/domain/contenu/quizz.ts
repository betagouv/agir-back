import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { TagRubrique } from '../scoring/tagRubrique';
import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { Categorie } from './categorie';
import { Thematique } from './thematique';

export class QuizzData {
  content_id: string;
  titre: string;
  soustitre: string;
  source: string;
  image_url: string;
  partenaire: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree: string;
  frequence: string;
  difficulty: number;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  tags_utilisateur: TagUtilisateur[];
  tags_rubriques: TagRubrique[];
  score: number;
  categorie: Categorie;
}

export class Quizz extends QuizzData implements TaggedContent {
  constructor(data: QuizzData) {
    super();
    Object.assign(this, data);
    if (!this.score) {
      this.score = 0;
    }
    if (this.rubrique_ids) {
      this.tags_rubriques = this.rubrique_ids.map((r) => TagRubrique[`R${r}`]);
    } else {
      this.tags_rubriques = [];
    }
  }

  public getTags(): Tag[] {
    return [].concat(
      this.thematiques,
      this.tags_utilisateur,
      this.tags_rubriques,
    );
  }

  public getDistinctText(): string {
    return this.titre;
  }
}
