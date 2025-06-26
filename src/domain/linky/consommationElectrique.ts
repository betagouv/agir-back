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

export type WinterUsageBreakdown = {
  consommation_totale_kwh: number;
  consommation_totale_euros: number;
  usageBreakdown: SingleUsage[];
  isStatistical: boolean;
  monthsOfDataAvailable: number;
  computingFinished: boolean;
};

export type ConsommationElectrique = {};
