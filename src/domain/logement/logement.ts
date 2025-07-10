import {
  Logement_v0,
  ScoreRisquesAdresse_v0,
} from '../object_store/logement/logement_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { NiveauRisqueLogement } from './NiveauRisque';
import { TypeRisqueLogement } from './TypeRisque';

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

export class ScoreRisquesAdresse
  implements Record<TypeRisqueLogement, NiveauRisqueLogement>
{
  secheresse: NiveauRisqueLogement;
  inondation: NiveauRisqueLogement;
  submersion: NiveauRisqueLogement;
  tempete: NiveauRisqueLogement;
  seisme: NiveauRisqueLogement;
  argile: NiveauRisqueLogement;
  radon: NiveauRisqueLogement;

  constructor(data: ScoreRisquesAdresse_v0) {
    Object.assign(this, data);
  }

  public isDefined(): boolean {
    return (
      !!this.secheresse ||
      !!this.inondation ||
      !!this.submersion ||
      !!this.tempete ||
      !!this.seisme ||
      !!this.argile ||
      !!this.radon
    );
  }
}

export class Logement {
  nombre_adultes: number;
  nombre_enfants: number;
  code_commune: string;
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
  prm: string;
  score_risques_adresse: ScoreRisquesAdresse;

  commune_label?: string;

  constructor(log?: Logement_v0) {
    if (!log) {
      this.score_risques_adresse = undefined;
      return;
    }
    this.nombre_adultes = log.nombre_adultes;
    this.nombre_enfants = log.nombre_enfants;
    this.code_postal = log.code_postal;
    this.commune = log.commune;
    this.type = log.type;
    this.prm = log.prm;
    this.superficie = log.superficie;
    this.proprietaire = log.proprietaire;
    this.chauffage = log.chauffage;
    this.plus_de_15_ans = log.plus_de_15_ans;
    this.dpe = log.dpe;
    this.numero_rue = log.numero_rue;
    this.rue = log.rue;
    this.latitude = log.latitude;
    this.longitude = log.longitude;
    this.code_commune = log.code_commune;
    this.score_risques_adresse = new ScoreRisquesAdresse(
      log.score_risques_adresse,
    );
  }

  patch?(input: Partial<Logement>, utilisateur: Utilisateur) {
    console.log('hahahah');
    console.log(input);
    this.nombre_adultes = this.AorB(input.nombre_adultes, this.nombre_adultes);
    this.nombre_enfants = this.AorB(input.nombre_enfants, this.nombre_enfants);

    this.code_postal = this.AorB(input.code_postal, this.code_postal);

    this.commune = this.AorB(input.commune, this.commune);

    this.type = this.AorB(input.type, this.type);
    this.superficie = this.AorB(input.superficie, this.superficie);
    this.proprietaire = this.AorB(input.proprietaire, this.proprietaire);
    this.chauffage = this.AorB(input.chauffage, this.chauffage);
    this.plus_de_15_ans = this.AorB(input.plus_de_15_ans, this.plus_de_15_ans);

    this.dpe = this.AorB(input.dpe, this.dpe);
    this.numero_rue = this.AorB(input.numero_rue, this.numero_rue);
    this.rue = this.AorB(input.rue, this.rue);
    this.longitude = this.AorB(input.longitude, this.longitude);
    this.latitude = this.AorB(input.latitude, this.latitude);
    this.code_commune = this.AorB(input.code_commune, this.code_commune);
    utilisateur.code_commune_classement = this.AorB(
      input.code_commune,
      this.code_commune,
    );
  }

  public possedeAdressePrecise(): boolean {
    return !!this.numero_rue && !!this.rue;
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
  }

  public getTailleFoyer(): number | undefined {
    if (!this.nombre_adultes && !this.nombre_enfants) {
      return undefined;
    }
    const adultes = this.nombre_adultes ? this.nombre_adultes : 0;
    const enfants = this.nombre_enfants ? this.nombre_enfants : 0;
    return enfants + adultes;
  }
}
