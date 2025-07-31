import { Adresse } from '../../logement/adresse';
import {
  Chauffage,
  DPE,
  Logement,
  ScoreRisquesAdresse,
  Superficie,
  TypeLogement,
} from '../../logement/logement';
import { NiveauRisqueLogement } from '../../logement/NiveauRisque';
import { Versioned_v0 } from '../versioned';

export class ScoreRisquesAdresse_v0 {
  secheresse: NiveauRisqueLogement;
  inondation: NiveauRisqueLogement;
  submersion: NiveauRisqueLogement;
  tempete: NiveauRisqueLogement;
  seisme: NiveauRisqueLogement;
  argile: NiveauRisqueLogement;
  radon: NiveauRisqueLogement;

  static serialise(score: ScoreRisquesAdresse): ScoreRisquesAdresse_v0 {
    if (!score) {
      return undefined;
    }
    return {
      argile: score.argile,
      inondation: score.inondation,
      radon: score.radon,
      secheresse: score.secheresse,
      seisme: score.seisme,
      submersion: score.submersion,
      tempete: score.tempete,
    };
  }
}

export class Adresse_v0 {
  id: string;
  date_creation: Date;
  code_commune: string;
  code_postal: string;
  numero_rue: string;
  rue: string;
  longitude: number;
  latitude: number;

  static serialise(adresse: Adresse): Adresse_v0 {
    return {
      id: adresse.id,
      code_commune: adresse.code_commune,
      code_postal: adresse.code_postal,
      numero_rue: adresse.numero_rue,
      rue: adresse.rue,
      longitude: adresse.longitude,
      latitude: adresse.latitude,
      date_creation: adresse.date_creation,
    };
  }
}

export class Logement_v0 extends Versioned_v0 {
  nombre_adultes: number;
  nombre_enfants: number;
  code_postal: string;
  code_commune: string;
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
  est_prm_obsolete: boolean;
  est_prm_par_adresse: boolean;
  score_risques_adresse: ScoreRisquesAdresse_v0;
  liste_adresses_recentes: Adresse_v0[];

  static serialise(domain: Logement): Logement_v0 {
    return {
      version: 0,
      nombre_adultes: domain.nombre_adultes,
      nombre_enfants: domain.nombre_enfants,
      code_postal: domain.code_postal,
      type: domain.type,
      superficie: domain.superficie,
      proprietaire: domain.proprietaire,
      chauffage: domain.chauffage,
      plus_de_15_ans: domain.plus_de_15_ans,
      dpe: domain.dpe,
      latitude: domain.latitude,
      longitude: domain.longitude,
      numero_rue: domain.numero_rue,
      rue: domain.rue,
      code_commune: domain.code_commune,
      score_risques_adresse: ScoreRisquesAdresse_v0.serialise(
        domain.score_risques_adresse,
      ),
      prm: domain.prm,
      est_prm_obsolete: domain.est_prm_obsolete,
      est_prm_par_adresse: domain.est_prm_par_adresse,
      liste_adresses_recentes: domain.liste_adresses_recentes.map((a) =>
        Adresse_v0.serialise(a),
      ),
    };
  }
}
