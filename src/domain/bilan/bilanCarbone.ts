import { Univers } from '../univers/univers';

export class DetailImpact {
  label: string;
  pourcentage: number;
  pourcentage_categorie: number;
  impact_kg_annee: number;
}

export class ImpactUnivers {
  univers: Univers;
  pourcentage: number;
  impact_kg_annee: number;
  details: DetailImpact[];
}
export class BilanCarbone {
  constructor(data: BilanCarbone) {
    Object.assign(this, data);
  }
  impact_kg_annee: number;
  top_3: DetailImpact[];
  impact_univers: ImpactUnivers[];

  getImpactParUnivers?(univers: Univers): ImpactUnivers {
    return this.impact_univers.find((a) => a.univers === univers);
  }
}
