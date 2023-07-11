import { Suivi } from './suivi';

export class SuiviTransport extends Suivi {
  constructor(date?: Date) {
    super(Suivi.transport, date);
  }

  km_voiture: number = 0;
  km_voiture_impact: number = 0;
  km_scooter: number = 0;
  km_scooter_impact: number = 0;
  velo: number = 0;
  velo_impact: number = 0;
  pied: number = 0;
  pied_impact: number = 0;
  train: number = 0;
  train_impact: number = 0;
  metro_tram: number = 0;
  metro_tram_impact: number = 0;
  bus: number = 0;
  bus_impact: number = 0;

  total_impact: number = 0;

  calculImpacts() {
    this.km_voiture_impact = this.km_voiture * 162;
    this.km_scooter_impact = this.km_scooter * 76;
    this.velo_impact = this.velo * 20;
    this.pied_impact = this.pied * 0;
    this.train_impact = this.train * 1000;
    this.metro_tram_impact = this.metro_tram * 500;
    this.bus_impact = this.bus * 800;

    this.total_impact =
      this.km_voiture_impact +
      this.km_scooter_impact +
      this.velo_impact +
      this.pied_impact +
      this.train_impact +
      this.metro_tram_impact +
      this.bus_impact;
  }
}
