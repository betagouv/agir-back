import { Suivi } from './suivi';

export class SuiviTransport extends Suivi {
  constructor(date?: Date) {
    super(Suivi.transport, date);
  }

  km_voiture: number = 0;
  km_voiture_impact: number = 0;
  km_scooter: number = 0;
  km_scooter_impact: number = 0;
  metro_tram: boolean = false;
  metro_tram_impact: number = 0;
  train: boolean = false;
  train_impact: number = 0;
  velo: boolean = false;
  velo_impact: number = 0;
  bus: boolean = false;
  bus_impact: number = 0;
  avion: boolean = false;
  avion_impact: number = 0;
  total_impact: number = 0;

  calculImpacts() {
    this.km_voiture_impact = this.km_voiture * 4000;
    this.km_scooter_impact = this.km_scooter * 1000;
    this.metro_tram_impact = this.metro_tram ? 1000 : 0;
    this.train_impact = this.train ? 2000 : 0;
    this.velo_impact = this.velo ? 500 : 0;
    this.bus_impact = this.bus ? 1000 : 0;
    this.avion_impact = this.avion ? 100000 : 0;

    this.total_impact =
      this.km_voiture_impact +
      this.km_scooter_impact +
      this.metro_tram_impact +
      this.train_impact +
      this.velo_impact +
      this.bus_impact +
      this.avion_impact;
  }
}
