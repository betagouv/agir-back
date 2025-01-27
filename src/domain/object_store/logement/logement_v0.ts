import { Versioned, Versioned_v0 } from '../versioned';
import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../logement/logement';

export class Logement_v0 extends Versioned_v0 {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  commune: string;
  code_commune: string;
  type: TypeLogement;
  superficie: Superficie;
  proprietaire: boolean;
  chauffage: Chauffage;
  plus_de_15_ans: boolean;
  dpe: DPE;

  static serialise(domain: Logement): Logement_v0 {
    return {
      version: 0,
      nombre_adultes: domain.nombre_adultes,
      nombre_enfants: domain.nombre_enfants,
      code_postal: domain.code_postal,
      commune: domain.commune,
      code_commune: domain.code_commune,
      type: domain.type,
      superficie: domain.superficie,
      proprietaire: domain.proprietaire,
      chauffage: domain.chauffage,
      plus_de_15_ans: domain.plus_de_15_ans,
      dpe: domain.dpe,
    };
  }
}
