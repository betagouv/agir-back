import { Equipements } from '../../../../src/domain/equipements/equipements';
import {
  Consommation100km,
  Vehicule,
  VehiculeType,
  VoitureCarburant,
  VoitureGabarit,
} from '../../../../src/domain/equipements/vehicule';
import { Versioned } from '../versioned';

export class Vehicule_v0 {
  nom: string;
  type: VehiculeType;
  gabarit: VoitureGabarit;
  carburant: VoitureCarburant;
  conso_100_km: Consommation100km;
  a_plus_de_10_ans: boolean;
  est_en_autopartage: boolean;

  static map(data: Vehicule): Vehicule_v0 {
    return {
      nom: data.nom,
      type: data.type,
      gabarit: data.gabarit,
      carburant: data.carburant,
      conso_100_km: data.conso_100_km,
      a_plus_de_10_ans: data.a_plus_de_10_ans,
      est_en_autopartage: data.est_en_autopartage,
    };
  }
}
export class Equipements_v0 extends Versioned {
  vehicules: Vehicule_v0[];

  static serialise(domain: Equipements): Equipements_v0 {
    return {
      version: 0,
      vehicules: domain.vehicules.map((e) => Vehicule_v0.map(e)),
    };
  }
}
