import { Suivi } from './suivi';
import { SuiviType } from './suiviType';

export class SuiviTransport extends Suivi {
  constructor(date?: Date, data?) {
    super(
      SuiviType.transport,
      {
        km_voiture: 0,
        km_voiture_impact: 0,
        km_scooter: 0,
        km_scooter_impact: 0,
        velo: 0,
        velo_impact: 0,
        pied: 0,
        pied_impact: 0,
        train: 0,
        train_impact: 0,
        metro_tram: 0,
        metro_tram_impact: 0,
        bus: 0,
        bus_impact: 0,
        total_impact: 0,
        ...data,
      },
      date,
    );
  }

  km_voiture: number;
  km_voiture_impact: number;
  km_scooter: number;
  km_scooter_impact: number;
  velo: number;
  velo_impact: number;
  pied: number;
  pied_impact: number;
  train: number;
  train_impact: number;
  metro_tram: number;
  metro_tram_impact: number;
  bus: number;
  bus_impact: number;
  total_impact: number;

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
