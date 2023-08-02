import { Suivi } from './suivi';
import { SuiviType } from './suiviType';

export class SuiviAlimentation extends Suivi {
  constructor(date?: Date, data?) {
    super(
      SuiviType.alimentation,
      {
        viande_rouge: 0,
        viande_rouge_impact: 0,
        viande_blanche: 0,
        viande_blanche_impact: 0,
        poisson_rouge: 0,
        poisson_rouge_impact: 0,
        poisson_blanc: 0,
        poisson_blanc_impact: 0,
        vegetarien: 0,
        vegetarien_impact: 0,
        vegetalien: 0,
        vegetalien_impact: 0,
        total_impact: 0,
        ...data,
      },
      date,
    );
  }
  viande_rouge: number;
  viande_rouge_impact: number;
  viande_blanche: number;
  viande_blanche_impact: number;
  poisson_rouge: number;
  poisson_rouge_impact: number;
  poisson_blanc: number;
  poisson_blanc_impact: number;
  vegetarien: number;
  vegetarien_impact: number;
  vegetalien: number;
  vegetalien_impact: number;
  total_impact: number;

  calculImpacts() {
    this.viande_rouge_impact = this.viande_rouge * 5510;
    this.viande_blanche_impact = this.viande_blanche * 2098;
    this.poisson_rouge_impact = this.poisson_rouge * 1630;
    this.poisson_blanc_impact = this.poisson_blanc * 2368;
    this.vegetarien_impact = this.vegetarien * 1115;
    this.vegetalien_impact = this.vegetalien * 785;

    this.total_impact =
      this.viande_rouge_impact +
      this.viande_blanche_impact +
      this.poisson_rouge_impact +
      this.poisson_blanc_impact +
      this.vegetarien_impact +
      this.vegetalien_impact;
  }
}
