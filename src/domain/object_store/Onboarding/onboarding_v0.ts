import { TransportQuotidien } from '../../../../src/domain/utilisateur/transport';
import {
  TypeLogement,
  Superficie,
  Chauffage,
} from '../../../../src/domain/utilisateur/logement';
import { Onboarding } from '../../utilisateur/onboarding/onboarding';
import { Repas, Consommation } from '../../utilisateur/onboarding/onboarding';
import { Versioned } from '../versioned';

export class Onboarding_v0 extends Versioned {
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

  static serialise(domain: Onboarding): Onboarding_v0 {
    return {
      version: 0,
      transports: domain.transports,
      avion: domain.avion,
      code_postal: domain.code_postal,
      commune: domain.commune,
      adultes: domain.adultes,
      enfants: domain.enfants,
      residence: domain.residence,
      proprietaire: domain.proprietaire,
      superficie: domain.superficie,
      chauffage: domain.chauffage,
      repas: domain.repas,
      consommation: domain.consommation,
    };
  }
}
