import { Suivi } from './suivi';

export class SuiviAlimentation extends Suivi {
  constructor(date?: Date) {
    super(Suivi.alimentation, date);
  }
  viande_rouge: number = 0;
  viande_rouge_impact: number = 0;
  viande_blanche: number = 0;
  viande_blanche_impact: number = 0;
  poisson: number = 0;
  poisson_impact: number = 0;
  laitages: number = 0;
  laitages_impact: number = 0;
  oeufs: number = 0;
  oeufs_impact: number = 0;
  total_impact: number = 0;

  calculImpacts() {
    this.viande_rouge_impact = this.viande_rouge * 4000;
    this.viande_blanche_impact = this.viande_blanche * 1000;
    this.poisson_impact = this.poisson * 500;
    this.laitages_impact = this.laitages * 300;
    this.oeufs_impact = this.oeufs * 100;

    this.total_impact =
      this.viande_rouge_impact +
      this.viande_blanche_impact +
      this.poisson_impact +
      this.laitages_impact +
      this.oeufs_impact;
  }
}
