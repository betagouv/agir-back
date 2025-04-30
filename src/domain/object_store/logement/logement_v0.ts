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
  pourcent_exposition_commune_secheresse_geotech_zone_1: number;
  pourcent_exposition_commune_secheresse_geotech_zone_2: number;
  pourcent_exposition_commune_secheresse_geotech_zone_3: number;
  pourcent_exposition_commune_secheresse_geotech_zone_4: number;
  pourcent_exposition_commune_secheresse_geotech_zone_5: number;
  pourcent_exposition_commune_secheresse_total_a_risque: number;

  pourcent_exposition_commune_inondation_zone_1: number;
  pourcent_exposition_commune_inondation_zone_2: number;
  pourcent_exposition_commune_inondation_zone_3: number;
  pourcent_exposition_commune_inondation_zone_4: number;
  pourcent_exposition_commune_inondation_zone_5: number;
  pourcent_exposition_commune_inondation_total_a_risque: number;

  static serialise(domain: Risques): Risques_v0 {
    return {
      nombre_catnat_commune: domain?.nombre_catnat_commune,

      pourcent_exposition_commune_secheresse_geotech_zone_1:
        domain?.pourcent_exposition_commune_secheresse_geotech_zone_1,
      pourcent_exposition_commune_secheresse_geotech_zone_2:
        domain?.pourcent_exposition_commune_secheresse_geotech_zone_2,
      pourcent_exposition_commune_secheresse_geotech_zone_3:
        domain?.pourcent_exposition_commune_secheresse_geotech_zone_3,
      pourcent_exposition_commune_secheresse_geotech_zone_4:
        domain?.pourcent_exposition_commune_secheresse_geotech_zone_4,
      pourcent_exposition_commune_secheresse_geotech_zone_5:
        domain?.pourcent_exposition_commune_secheresse_geotech_zone_5,

      pourcent_exposition_commune_inondation_zone_1:
        domain?.pourcent_exposition_commune_inondation_zone_1,
      pourcent_exposition_commune_inondation_zone_2:
        domain?.pourcent_exposition_commune_inondation_zone_2,
      pourcent_exposition_commune_inondation_zone_3:
        domain?.pourcent_exposition_commune_inondation_zone_3,
      pourcent_exposition_commune_inondation_zone_4:
        domain?.pourcent_exposition_commune_inondation_zone_4,
      pourcent_exposition_commune_inondation_zone_5:
        domain?.pourcent_exposition_commune_inondation_zone_5,

      pourcent_exposition_commune_inondation_total_a_risque:
        domain?.pourcent_exposition_commune_inondation_total_a_risque,
      pourcent_exposition_commune_secheresse_total_a_risque:
        domain?.pourcent_exposition_commune_secheresse_geotech_total_a_risque,
    };
  }
}

export class Logement_v0 extends Versioned_v0 {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  commune: string;
  numero_rue: string; // 3, 12bis
  rue: string; // avenue de la paix
  longitude: number;
  latitude: number;
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
      latitude: domain.latitude,
      longitude: domain.longitude,
      numero_rue: domain.numero_rue,
      rue: domain.rue,
    };
  }
}
