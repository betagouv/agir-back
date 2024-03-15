import { Thematique } from '../contenu/thematique';
import { Defi_v0 } from '../object_store/defi/defiHistory_v0';
import { Tag } from '../scoring/tag';

export class Defi {
  id: string;
  titre: string;
  points: number;
  thematique: Thematique;
  tags: Tag[];

  constructor(data: Defi_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.points = data.points;
    this.thematique = data.thematique;
    this.tags = data.tags;
  }
}
