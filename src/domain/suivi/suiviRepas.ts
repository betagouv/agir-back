import { Suivi } from './suivi';

export class SuiviRepas extends Suivi {
  constructor(date?: Date) {
    super('repas', date);
  }

  viande_rouge: number;
  viande_rouge_impact: number;
  viande_blanche: number;
  viande_blanche_impact: number;
  poisson: number;
  poisson_impact: number;
  laitages: number;
  laitages_impact: number;
  oeufs: number;
  oeufs_impact: number;
}
