import { Univers } from '../univers/univers';

export class DetailImpact {
  label: string;
  emoji: string;
  pourcentage: number;
  pourcentage_categorie: number;
  impact_kg_annee: number;
}

export enum NiveauImpact {
  faible = 'faible',
  moyen = 'moyen',
  fort = 'fort',
  tres_fort = 'tres_fort',
}

export class ImpactUnivers {
  univers: Univers;
  pourcentage: number;
  impact_kg_annee: number;
  emoji: string;
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

export class LienBilanUnivers {
  univers: Univers;
  image_url: string;
  pourcentage_progression: number;
  nombre_total_question: number;
  id_enchainement_kyc: string;
}

export class BilanCarboneSynthese {
  constructor(data: BilanCarboneSynthese) {
    Object.assign(this, data);
  }

  impact_transport: NiveauImpact;
  impact_alimentation: NiveauImpact;
  impact_logement: NiveauImpact;
  impact_consommation: NiveauImpact;
  pourcentage_completion_totale: number;
  liens_bilans_univers: LienBilanUnivers[];
}
