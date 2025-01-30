import { Logement_v0 } from '../object_store/logement/logement_v0';
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

export class Logement {
  nombre_adultes: number | null;
  nombre_enfants: number | null;
  code_postal: string | null;
  commune: string | null;
  commune_label?: string;
  type: TypeLogement | null;
  superficie: Superficie | null;
  proprietaire: boolean | null;
  chauffage: Chauffage | null;
  plus_de_15_ans: boolean | null;
  dpe: DPE | null;

  constructor(log?: Logement_v0) {
    if (!log) return;
    // NOTE: How this values could be undefined?
    this.nombre_adultes = undefinedToNull(log.nombre_adultes);
    this.nombre_enfants = undefinedToNull(log.nombre_enfants);
    this.code_postal = undefinedToNull(log.code_postal);
    this.commune = undefinedToNull(log.commune);
    this.type = undefinedToNull(log.type);
    this.superficie = undefinedToNull(log.superficie);
    this.proprietaire = undefinedToNull(log.proprietaire);
    this.chauffage = undefinedToNull(log.chauffage);
    this.plus_de_15_ans = undefinedToNull(log.plus_de_15_ans);
    this.dpe = undefinedToNull(log.dpe);
  }

  patch?(input: Logement, utilisateur: Utilisateur) {
    this.nombre_adultes = AorB(input.nombre_adultes, this.nombre_adultes);
    this.nombre_enfants = AorB(input.nombre_enfants, this.nombre_enfants);

    this.code_postal = AorB(input.code_postal, this.code_postal);
    utilisateur.code_postal_classement = this.code_postal;

    this.commune = AorB(input.commune, this.commune);
    utilisateur.commune_classement = this.commune;

    this.type = AorB(input.type, this.type);
    this.superficie = AorB(input.superficie, this.superficie);
    this.proprietaire = AorB(input.proprietaire, this.proprietaire);
    this.chauffage = AorB(input.chauffage, this.chauffage);
    this.plus_de_15_ans = AorB(input.plus_de_15_ans, this.plus_de_15_ans);

    this.dpe = AorB(input.dpe, this.dpe);
  }
}

function undefinedToNull<T>(val: T | undefined): T | null {
  return val === undefined ? null : val;
}

function AorB<T>(a: T, b: T): T {
  if (a === undefined) return b;
  return a;
}
