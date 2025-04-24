import { Logement_v0, Risques_v0 } from '../object_store/logement/logement_v0';
import { Utilisateur } from '../utilisateur/utilisateur';

export enum TypeLogement {
  maison = 'maison',
  appartement = 'appartement',
}

export enum Superficie {
  superficie_35 = 'superficie_35',
  superficie_70 = 'superficie_70',
  superficie_100 = 'superficie_100',
  superficie_150 = 'superficie_150',
  superficie_150_et_plus = 'superficie_150_et_plus',
}
export enum Chauffage {
  electricite = 'electricite',
  bois = 'bois',
  fioul = 'fioul',
  gaz = 'gaz',
  autre = 'autre',
}
export enum DPE {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  ne_sais_pas = 'ne_sais_pas',
}

export class Risques {
  nombre_catnat_commune: number;
  pourcent_exposition_commune_secheresse_geotech_zone_1: number;
  pourcent_exposition_commune_secheresse_geotech_zone_2: number;
  pourcent_exposition_commune_secheresse_geotech_zone_3: number;
  pourcent_exposition_commune_secheresse_geotech_zone_4: number;
  pourcent_exposition_commune_secheresse_geotech_zone_5: number;
  pourcent_exposition_commune_innondations: number;

  constructor(risques: Risques_v0) {
    if (risques) {
      this.nombre_catnat_commune = risques.nombre_catnat_commune;
      this.pourcent_exposition_commune_innondations =
        risques.pourcent_exposition_commune_innondations;
      this.pourcent_exposition_commune_secheresse_geotech_zone_1 =
        risques.pourcent_exposition_commune_secheresse_geotech_zone_1;
      this.pourcent_exposition_commune_secheresse_geotech_zone_2 =
        risques.pourcent_exposition_commune_secheresse_geotech_zone_2;
      this.pourcent_exposition_commune_secheresse_geotech_zone_3 =
        risques.pourcent_exposition_commune_secheresse_geotech_zone_3;
      this.pourcent_exposition_commune_secheresse_geotech_zone_4 =
        risques.pourcent_exposition_commune_secheresse_geotech_zone_4;
      this.pourcent_exposition_commune_secheresse_geotech_zone_5 =
        risques.pourcent_exposition_commune_secheresse_geotech_zone_5;
    }
  }
}

export class Logement {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  commune: string;
  commune_label?: string;
  type: TypeLogement;
  superficie: Superficie;
  proprietaire: boolean;
  chauffage: Chauffage;
  plus_de_15_ans: boolean;
  dpe: DPE;
  risques: Risques;

  constructor(log?: Logement_v0) {
    if (!log) return;
    this.nombre_adultes = this.undefinedToNull(log.nombre_adultes);
    this.nombre_enfants = this.undefinedToNull(log.nombre_enfants);
    this.code_postal = this.undefinedToNull(log.code_postal);
    this.commune = this.undefinedToNull(log.commune);
    this.type = this.undefinedToNull(log.type);
    this.superficie = this.undefinedToNull(log.superficie);
    this.proprietaire = this.undefinedToNull(log.proprietaire);
    this.chauffage = this.undefinedToNull(log.chauffage);
    this.plus_de_15_ans = this.undefinedToNull(log.plus_de_15_ans);
    this.dpe = this.undefinedToNull(log.dpe);
    this.risques = new Risques(log.risques);
  }

  patch?(input: Partial<Logement>, utilisateur: Utilisateur) {
    this.nombre_adultes = this.AorB(input.nombre_adultes, this.nombre_adultes);
    this.nombre_enfants = this.AorB(input.nombre_enfants, this.nombre_enfants);

    this.code_postal = this.AorB(input.code_postal, this.code_postal);
    utilisateur.code_postal_classement = this.code_postal;

    this.commune = this.AorB(input.commune, this.commune);
    utilisateur.commune_classement = this.commune;

    this.type = this.AorB(input.type, this.type);
    this.superficie = this.AorB(input.superficie, this.superficie);
    this.proprietaire = this.AorB(input.proprietaire, this.proprietaire);
    this.chauffage = this.AorB(input.chauffage, this.chauffage);
    this.plus_de_15_ans = this.AorB(input.plus_de_15_ans, this.plus_de_15_ans);

    this.dpe = this.AorB(input.dpe, this.dpe);
  }

  private undefinedToNull?<T>(val: T | undefined): T | null {
    return val === undefined ? null : val;
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }
}
