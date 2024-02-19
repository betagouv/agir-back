import { Vehicule_v0 } from '../object_store/equipement/equipement_v0';

export enum Consommation100km {
  moins_5L = 'moins_5L',
  entre_5_10L = 'entre_5_10L',
  plus_10_L = 'plus_10_L',
  je_sais_pas = 'je_sais_pas',
}
export enum VoitureCarburant {
  B7_B10 = 'B7_B10',
  E5_E10 = 'E5_E10',
  E85 = 'E85',
}
export enum VoitureGabarit {
  petite = 'petite',
  moyenne = 'moyenne',
  VUL = 'VUL',
  berline = 'berline',
  SUV = 'SUV',
}
export enum VehiculeType {
  voiture = 'voiture',
  camping_car = 'camping_car',
  moto_scooter = 'moto_scooter',
  velo = 'velo',
  trottinette = 'trottinette',
}

export class Vehicule {
  nom: string;
  type: VehiculeType;
  gabarit?: VoitureGabarit;
  carburant?: VoitureCarburant;
  a_plus_de_10_ans: boolean;
  est_en_autopartage: boolean;
  conso_100_km: Consommation100km;

  constructor(data: Vehicule_v0) {
    this.nom = data.nom;
    this.type = data.type;
    this.gabarit = data.gabarit;
    this.carburant = data.carburant;
    this.conso_100_km = data.conso_100_km;
    this.a_plus_de_10_ans = data.a_plus_de_10_ans
      ? data.a_plus_de_10_ans
      : false;
    this.est_en_autopartage = data.est_en_autopartage
      ? data.est_en_autopartage
      : false;
  }
}
