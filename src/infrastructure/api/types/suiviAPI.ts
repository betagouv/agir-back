import { ApiProperty } from '@nestjs/swagger';

export enum SuiviTypeAPI {
  alimentation = 'alimentation',
  transport = 'transport',
}

export class SuiviAlimentationAPI {
  @ApiProperty({ pattern: 'alimentation' }) type: string;
  @ApiProperty() date: Date;
  @ApiProperty() viande_rouge: number;
  @ApiProperty() viande_rouge_impact: number;
  @ApiProperty() viande_blanche: number;
  @ApiProperty() viande_blanche_impact: number;
  @ApiProperty() poisson_rouge: number;
  @ApiProperty() poisson_rouge_impact: number;
  @ApiProperty() poisson_blanc: number;
  @ApiProperty() poisson_blanc_impact: number;
  @ApiProperty() vegetarien: number;
  @ApiProperty() vegetarien_impact: number;
  @ApiProperty() vegetalien: number;
  @ApiProperty() vegetalien_impact: number;
  @ApiProperty() total_impact: number;
  static example() {
    return {
      type: 'alimentation',
      date: new Date(),
      viande_rouge: 0,
      viande_rouge_impact: 0,
      viande_blanche: 1,
      poisson_rouge: 0,
      poisson_blanc: 2,
      vegetarien: 0,
      vegetalien: 0,
    } as SuiviAlimentationAPI;
  }
}

export class SuiviTransportAPI {
  @ApiProperty({ pattern: 'transport' }) type: string;
  @ApiProperty() date: Date;
  @ApiProperty() km_voiture: number;
  @ApiProperty() km_voiture_impact: number;
  @ApiProperty() km_scooter: number;
  @ApiProperty() km_scooter_impact: number;
  @ApiProperty() velo: number;
  @ApiProperty() velo_impact: number;
  @ApiProperty() pied: number;
  @ApiProperty() pied_impact: number;
  @ApiProperty() train: number;
  @ApiProperty() train_impact: number;
  @ApiProperty() metro_tram: number;
  @ApiProperty() metro_tram_impact: number;
  @ApiProperty() bus: number;
  @ApiProperty() bus_impact: number;
  @ApiProperty() total_impact: number;
  static example() {
    return {
      type: 'transport',
      date: new Date(),
      km_voiture: 10,
      km_scooter: 100,
      velo: 60,
      pied: 120,
      train: 0,
      metro_tram: 0,
      bus: 0,
    } as SuiviTransportAPI;
  }
}
