import { Thematique } from '../contenu/thematique';
import { Tag } from '../scoring/tag';

export class DefiDefinition {
  content_id: string;
  titre: string;
  sous_titre: string;
  points: number;
  pourquoi: string;
  astuces: string;
  thematique: Thematique;
  tags: Tag[];

  constructor(data: DefiDefinition) {
    this.content_id = data.content_id;
    this.titre = data.titre;
    this.sous_titre = data.sous_titre;
    this.points = data.points;
    this.thematique = data.thematique;
    this.tags = data.tags;
    this.astuces = data.astuces;
    this.pourquoi = data.pourquoi;
  }
}
