import { Situation } from 'publicodes';
import { DottedName } from '@incubateur-ademe/nosgestesclimat';

import { Thematique } from '../thematique/thematique';

export type RegleNGC = DottedName;
export type SituationNGC = Situation<DottedName>;

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

export class ImpactThematique {
  thematique: Thematique;
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
  impact_thematique: ImpactThematique[];

  getImpactParThematique?(thematique: Thematique): ImpactThematique {
    return this.impact_thematique.find((a) => a.thematique === thematique);
  }
}

export class LienBilanThematique {
  thematique: Thematique;
  image_url: string;
  pourcentage_progression: number;
  nombre_total_question: number;
  id_enchainement_kyc: string;
  temps_minutes: number;
}

export class BilanCarboneSynthese {
  constructor(data: BilanCarboneSynthese) {
    Object.assign(this, data);
  }

  mini_bilan_dispo: boolean;
  bilan_complet_dispo: boolean;
  impact_transport: NiveauImpact;
  impact_alimentation: NiveauImpact;
  impact_logement: NiveauImpact;
  impact_consommation: NiveauImpact;
  pourcentage_completion_totale: number;
  liens_bilans_thematiques: LienBilanThematique[];
}

// NOTE: we may want to approximate with 52.1429 to account for leap years
export const NB_SEMAINES_PAR_ANNEE = 52;
