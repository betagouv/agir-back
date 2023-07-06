import { Suivi } from './suivi';

export class SuiviAlimentation extends Suivi {
  constructor(date?: Date) {
    super(Suivi.alimentation, date);
  }
  viande_rouge: number = 0;
  viande_rouge_impact: number = 0;
  viande_blanche: number = 0;
  viande_blanche_impact: number = 0;
  poisson_rouge: number = 0;
  poisson_rouge_impact: number = 0;
  poisson_blanc: number = 0;
  poisson_blanc_impact: number = 0;
  vegetarien: number = 0;
  vegetarien_impact: number = 0;
  vegetalien: number = 0;
  vegetalien_impact: number = 0;
  total_impact: number = 0;

  calculImpacts() {
    this.viande_rouge_impact = this.viande_rouge * 4000;
    this.viande_blanche_impact = this.viande_blanche * 1000;
    this.poisson_rouge_impact = this.poisson_rouge * 500;
    this.poisson_blanc_impact = this.poisson_blanc * 400;
    this.vegetarien_impact = this.vegetarien * 300;
    this.vegetalien_impact = this.vegetalien_impact * 100;

    this.total_impact =
      this.viande_rouge_impact +
      this.viande_blanche_impact +
      this.poisson_rouge_impact +
      this.poisson_blanc_impact +
      this.vegetarien_impact +
      this.vegetalien_impact;
  }
}
