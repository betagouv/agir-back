import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { Tag } from '../scoring/tag';
import { ConditionDefi } from './conditionDefi';

export class DefiDefinition {
  content_id: string;
  titre: string;
  sous_titre: string;
  points: number;
  pourquoi: string;
  astuces: string;
  thematique: Thematique;
  tags: Tag[];
  universes: string[];
  thematiques_univers: string[];
  categorie: Categorie;
  mois: number[];
  conditions: ConditionDefi[][];

  constructor(data: DefiDefinition) {
    this.content_id = data.content_id;
    this.titre = data.titre;
    this.sous_titre = data.sous_titre;
    this.points = data.points;
    this.thematique = data.thematique;
    this.tags = data.tags;
    this.astuces = data.astuces;
    this.pourquoi = data.pourquoi;
    this.thematiques_univers = data.thematiques_univers
      ? data.thematiques_univers
      : [];
    this.universes = data.universes ? data.universes : [];
    this.mois = data.mois ? data.mois : [];
    this.categorie = data.categorie;
    this.mois = data.mois ? data.mois : [];
    this.conditions = data.conditions ? data.conditions : [];
  }
}
