import { Versioned, Versioned_v0 } from '../versioned';
import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../logement/logement';

export class Logement_v0 extends Versioned_v0 {
  nombre_adultes: number | null;
  nombre_enfants: number | null;
  code_postal: string | null;
  commune: string | null;
  type: TypeLogement | null;
  superficie: Superficie | null;
  proprietaire: boolean | null;
  chauffage: Chauffage | null;
  plus_de_15_ans: boolean | null;
  dpe: DPE | null;

  static serialise(domain: Logement): Logement_v0 {
    return {
      version: 0,
      nombre_adultes: domain.nombre_adultes,
      nombre_enfants: domain.nombre_enfants,
      code_postal: domain.code_postal,
      commune: domain.commune,
      type: domain.type,
      superficie: domain.superficie,
      proprietaire: domain.proprietaire,
      chauffage: domain.chauffage,
      plus_de_15_ans: domain.plus_de_15_ans,
      dpe: domain.dpe,
    };
  }
}
