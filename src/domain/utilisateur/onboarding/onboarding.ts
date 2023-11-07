export enum Transport {
  voiture = 'voiture',
  moto = 'moto',
  pied = 'pied',
  velo = 'velo',
  commun = 'commun',
}
export enum Residence {
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

export enum Thematique {
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

export class OnboardingData {
  transports: Transport[];
  avion: number;
  code_postal: string;
  commune: string;
  adultes: number;
  enfants: number;
  residence: Residence;
  proprietaire: boolean;
  superficie: Superficie;
  chauffage: Chauffage;
  repas: Repas;
  consommation: Consommation;
}

export class Onboarding extends OnboardingData {
  constructor(data: OnboardingData) {
    super();
    Object.assign(this, data);
  }

  getTransportLevel(): Impact {
    let avion: boolean = this.avion ? this.avion > 0 : false;
    let nbr_avion = this.avion ? this.avion : 0;
    let voiture: boolean = this.hasTransport(Transport.voiture);
    let moto: boolean = this.hasTransport(Transport.moto);

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
    let residence = this.residence === Residence.maison ? 2 : 1;
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
  private hasTransport(transport: Transport) {
    return this.transports ? this.transports.indexOf(transport) >= 0 : false;
  }

  validateData() {
    if (this.transports) {
      this.transports.forEach((value) => {
        if (!(value in Transport))
          throw new Error(`Valeur transport [${value}] inconnue`);
      });
    } else {
      throw new Error(`Valeur transport obligatoire`);
    }
    if (this.residence) {
      if (!(this.residence in Residence))
        throw new Error(`Valeur residence [${this.residence}] inconnue`);
    } else {
      throw new Error(`Valeur residence obligatoire`);
    }
    if (this.superficie) {
      if (!(this.superficie in Superficie))
        throw new Error(`Valeur superficie [${this.superficie}] inconnue`);
    } else {
      throw new Error(`Valeur superficie obligatoire`);
    }
    if (this.chauffage) {
      if (!(this.chauffage in Chauffage))
        throw new Error(`Valeur chauffage [${this.chauffage}] inconnue`);
    } else {
      throw new Error(`Valeur chauffage obligatoire`);
    }
    if (this.repas) {
      if (!(this.repas in Repas))
        throw new Error(`Valeur repas [${this.repas}] inconnue`);
    } else {
      throw new Error(`Valeur repas obligatoire`);
    }
    if (this.consommation) {
      if (!(this.consommation in Consommation))
        throw new Error(`Valeur consommation [${this.consommation}] inconnue`);
    } else {
      throw new Error(`Valeur consommation obligatoire`);
    }
  }
}
