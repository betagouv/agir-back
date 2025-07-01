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

export type ConsommationElectrique = {
  consommation_totale_euros: number;
  detail_usages: SingleUsage[];
  isStatistical: boolean;
  monthsOfDataAvailable: number;
  computingFinished: boolean;
  nombre_actions_associees: number;
};
