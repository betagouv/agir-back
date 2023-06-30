import { Suivi } from './suivi';

export class SuiviTransport extends Suivi {
  constructor(date?: Date) {
    super('transport', date);
  }

  km_voiture: number;
  km_voiture_impact: number;
  km_scooter: number;
  km_scooter_impact: number;
  metro_tram: boolean;
  metro_tram_impact: number;
  train: boolean;
  train_impact: number;
  velo: boolean;
  velo_impact: number;
  bus: boolean;
  bus_impact: number;
  avion: boolean;
  avion_impact: number;
}
