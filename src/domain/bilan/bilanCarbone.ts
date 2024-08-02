import { Univers } from '../univers/univers';

export class ImpactUnivers {
  univers: Univers;
  pourcentage: number;
  impact_kg_annee: number;
}
export class BilanCarbone {
  constructor(data: BilanCarbone) {
    Object.assign(this, data);
  }
  impact_kg_annee: number;
  detail: ImpactUnivers[];

  getImpactParUnivers?(univers: Univers): ImpactUnivers {
    return this.detail.find((a) => a.univers === univers);
  }
}
