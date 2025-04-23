import {
  Chauffage,
  DPE,
  Logement,
  Risques,
  Superficie,
  TypeLogement,
} from '../../logement/logement';
import { Versioned_v0 } from '../versioned';

export class Risques_v0 {
  nombre_catnat_commune: number;
  pourcent_exposition_commune_secheresse_geotech: number;
  pourcent_exposition_commune_innondations: number;

  static serialise(domain: Risques): Risques_v0 {
    return {
      nombre_catnat_commune: domain.nombre_catnat_commune,
      pourcent_exposition_commune_innondations:
        domain.pourcent_exposition_commune_innondations,
      pourcent_exposition_commune_secheresse_geotech:
        domain.pourcent_exposition_commune_secheresse_geotech,
    };
  }
}

export class Logement_v0 extends Versioned_v0 {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  commune: string;
  type: TypeLogement;
  superficie: Superficie;
  proprietaire: boolean;
  chauffage: Chauffage;
  plus_de_15_ans: boolean;
  dpe: DPE;
  risques: Risques_v0;

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
      risques: Risques_v0.serialise(domain.risques),
    };
  }
}
