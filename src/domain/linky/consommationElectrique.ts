export enum TypeUsage {
  heating = 'heating',
  hotWater = 'hotWater',
  cooking = 'cooking',
  appliances = 'appliances',
  multimedia = 'multimedia',
  airConditioning = 'airConditioning',
  lighting = 'lighting',
  mobility = 'mobility',
  swimmingPool = 'swimmingPool',
  other = 'other',
}

export type SingleUsage = {
  type: TypeUsage;
  kWh: number;
  eur: number;
  percent: number;
};

export class ConsommationElectrique {
  consommation_totale_euros: number;
  detail_usages: SingleUsage[];
  monthsOfDataAvailable: number;
  computingFinished: boolean;
  nombre_actions_associees: number;
  economies_realisees_euros: number;

  constructor(data: ConsommationElectrique) {
    Object.assign(this, data);
  }

  getEconomiesPossibles?() {
    let eco_total = 0;
    for (const usage of this.detail_usages) {
      eco_total += usage.eur;
    }
    return eco_total;
  }
}
