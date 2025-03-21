import { Categorie } from '../contenu/categorie';
import { Thematique } from '../thematique/thematique';
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
  categorie: Categorie;
  mois: number[];
  conditions: ConditionDefi[][];
  impact_kg_co2: number;

  constructor(data: DefiDefinition) {
    Object.assign(this, data);
    this.mois = data.mois ? data.mois : [];
    this.mois = data.mois ? data.mois : [];
    this.conditions = data.conditions ? data.conditions : [];
  }
}
