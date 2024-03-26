import { Onboarding_v0 } from '../../../../src/domain/object_store/Onboarding/onboarding_v0';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { TypeLogement, Superficie, Chauffage } from '../logement';
import { TransportQuotidien } from '../transport';

export enum Repas {
  tout = 'tout',
  vege = 'vege',
  vegan = 'vegan',
  viande = 'viande',
}
export enum Consommation {
  jamais = 'jamais',
  raisonnable = 'raisonnable',
  secondemain = 'secondemain',
  shopping = 'shopping',
}

export enum ThematiqueOnboarding {
  transports = 'transports',
  alimentation = 'alimentation',
  logement = 'logement',
  consommation = 'consommation',
}

export enum Impact {
  tres_faible = 1,
  faible = 2,
  eleve = 3,
  tres_eleve = 4,
}

export class Onboarding {
  transports: TransportQuotidien[];
  avion: number;
  code_postal: string;
  commune: string;
  adultes: number;
  enfants: number;
  residence: TypeLogement;
  proprietaire: boolean;
  superficie: Superficie;
  chauffage: Chauffage;
  repas: Repas;
  consommation: Consommation;

  constructor(data?: Onboarding_v0) {
    if (!data) return;
    this.transports = data.transports;
    this.avion = data.avion;
    this.code_postal = data.code_postal;
    this.commune = data.commune;
    this.adultes = data.adultes;
    this.enfants = data.enfants;
    this.residence = data.residence;
    this.proprietaire = data.proprietaire;
    this.superficie = data.superficie;
    this.chauffage = data.chauffage;
    this.repas = data.repas;
    this.consommation = data.consommation;
  }

  getTransportLevel(): Impact {
    let avion: boolean = this.avion ? this.avion > 0 : false;
    let nbr_avion = this.avion ? this.avion : 0;
    let voiture: boolean = this.hasTransport(TransportQuotidien.voiture);
    let moto: boolean = this.hasTransport(TransportQuotidien.moto);

    if (!avion && !voiture && moto) return Impact.faible;

    if (!avion && !voiture) return Impact.tres_faible;

    if ((voiture && nbr_avion < 2) || (!voiture && nbr_avion < 3))
      return Impact.eleve;

    return Impact.tres_eleve;
  }

  getLogementLevel(): Impact {
    let adultes = this.adultes || 0;
    if (adultes >= 2) adultes = 1 + 0.66 * (adultes - 1);
    let enfants = this.enfants || 0;
    enfants = enfants * 0.33;
    let residence = this.residence === TypeLogement.maison ? 2 : 1;
    let superficie;
    let chauffage;
    switch (this.superficie) {
      case Superficie.superficie_35:
        superficie = 1;
        break;
      case Superficie.superficie_70:
        superficie = 2;
        break;
      case Superficie.superficie_100:
        superficie = 3;
        break;
      case Superficie.superficie_150:
        superficie = 4;
        break;
      case Superficie.superficie_150_et_plus:
        superficie = 5;
        break;
      default:
        superficie = 5;
        break;
    }
    switch (this.chauffage) {
      case Chauffage.electricite:
        chauffage = 1;
        break;
      case Chauffage.bois:
        chauffage = 1;
        break;
      case Chauffage.autre:
        chauffage = 2;
        break;
      case Chauffage.gaz:
        chauffage = 3;
        break;
      case Chauffage.fioul:
        chauffage = 4;
        break;
      default:
        chauffage = 4;
        break;
    }

    const score = (residence * superficie * chauffage) / (adultes + enfants);

    if (score > 8) return Impact.tres_eleve;
    if (score >= 4.1) return Impact.eleve;
    if (score >= 2.1) return Impact.faible;
    if (score < 2.1) return Impact.tres_faible;
  }
  getAlimentationLevel(): Impact {
    if (this.repas === Repas.vegan) return Impact.tres_faible;
    if (this.repas === Repas.vege) return Impact.faible;
    if (this.repas === Repas.tout) return Impact.eleve;
    if (this.repas === Repas.viande) return Impact.tres_eleve;
  }
  getConsommationLevel(): Impact {
    if (this.consommation === Consommation.jamais) return Impact.tres_faible;
    if (this.consommation === Consommation.secondemain) return Impact.faible;
    if (this.consommation === Consommation.raisonnable) return Impact.eleve;
    if (this.consommation === Consommation.shopping) return Impact.tres_eleve;
  }
  private hasTransport(transport: TransportQuotidien) {
    return this.transports ? this.transports.indexOf(transport) >= 0 : false;
  }

  validateData() {
    if (this.transports) {
      this.transports.forEach((value) => {
        if (!(value in TransportQuotidien))
          ApplicationError.throwValeurInconnueOnboarding('transport', value);
      });
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding(`transport`);
    }
    if (this.residence) {
      if (!(this.residence in TypeLogement))
        ApplicationError.throwValeurInconnueOnboarding(
          'residence',
          this.residence,
        );
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding(`residence`);
    }
    if (this.superficie) {
      if (!(this.superficie in Superficie))
        ApplicationError.throwValeurInconnueOnboarding(
          'superficie',
          this.superficie,
        );
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding(`superficie`);
    }
    if (this.chauffage) {
      if (!(this.chauffage in Chauffage))
        ApplicationError.throwValeurInconnueOnboarding(
          'chauffage',
          this.chauffage,
        );
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding('chauffage');
    }
    if (this.repas) {
      if (!(this.repas in Repas))
        ApplicationError.throwValeurInconnueOnboarding('repas', this.repas);
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding('repas');
    }
    if (this.consommation) {
      if (!(this.consommation in Consommation))
        ApplicationError.throwValeurInconnueOnboarding(
          'consommation',
          this.consommation,
        );
    } else {
      ApplicationError.throwDonneeObligatoireOnboarding('consommation');
    }
  }
}
