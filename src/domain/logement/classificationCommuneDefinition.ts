export enum ClassificationCommune {
  peri_urbain = 'peri_urbain',
  rural = 'rural',
  urbain = 'urbain',
}

export class ClassificationCommuneDefinition {
  code_commune: string;
  classification: ClassificationCommune;
  CATEAAV2020: number;
  TAAV2017: number;
  est_drom: boolean;
}
