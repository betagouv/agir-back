import { DefiHistory_v0 } from './defi/defiHistory_v0';
import { Equipements_v0 } from './equipement/equipement_v0';
import { Gamification_v0 } from './gamification/gamification_v0';
import { History_v0 } from './history/history_v0';
import { KYCHistory_v0 } from './kyc/kycHistory_v0';
import { Logement_v0 } from './logement/logement_v0';
import { MissionsUtilisateur_v0 } from './mission/MissionsUtilisateur_v0';
import { Onboarding_v0 } from './Onboarding/onboarding_v0';
import { OnboardingResult_v0 } from './onboardingResult/onboardingResult_v0';
import { ParcoursTodo_v0 } from './parcoursTodo/parcoursTodo_v0';
import { BibliothequeServices_v0 } from './service/BibliothequeService_v0';
import { Transport_v0 } from './transport/transport_v0';
import { UnlockedFeatures_v0 } from './unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from './unlockedFeatures/unlockedFeatures_v1';

export enum SerialisableDomain {
  UnlockedFeatures = 'UnlockedFeatures',
  ParcoursTodo = 'ParcoursTodo',
  History = 'History',
  Gamification = 'Gamification',
  OnboardingResult = 'OnboardingResult',
  Onboarding = 'Onboarding',
  KYCHistory = 'KYCHistory',
  DefiHistory = 'DefiHistory',
  Equipements = 'Equipements',
  Logement = 'Logement',
  Transport = 'Transport',
  MissionsUtilisateur = 'MissionsUtilisateur',
  BibliothequeServices = 'BibliothequeServices',
  Object = 'Object',
}
const CLASS_DICTIONNARY = {
  UnlockedFeatures_v0: UnlockedFeatures_v0,
  UnlockedFeatures_v1: UnlockedFeatures_v1,
  ParcoursTodo_v0: ParcoursTodo_v0,
  History_v0: History_v0,
  Gamification_v0: Gamification_v0,
  OnboardingResult_v0: OnboardingResult_v0,
  Onboarding_v0: Onboarding_v0,
  KYCHistory_v0: KYCHistory_v0,
  Equipements_v0: Equipements_v0,
  Logement_v0: Logement_v0,
  Transport_v0: Transport_v0,
  DefiHistory_v0: DefiHistory_v0,
  MissionsUtilisateur_v0: MissionsUtilisateur_v0,
  BibliothequeServices_v0: BibliothequeServices_v0,
};

const DATE_REGEXP =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export class Upgrader {
  public static upgradeRaw(raw: any, className: SerialisableDomain): any {
    let current_version: number = raw['version'] || 0;

    current_version++; // starting from 1 or more

    let current_raw = raw;
    let current_class = Upgrader.getClassFromVersion(
      className,
      current_version,
    );

    while (current_class) {
      current_raw = current_class.upgrade(raw);
      current_version++;
      current_class = Upgrader.getClassFromVersion(className, current_version);
    }

    Upgrader.convertAllDateAttributes(current_raw);

    return current_raw;
  }

  public static serialiseToLastVersion(
    domain: any,
    className: SerialisableDomain,
  ): any {
    let current_version: number = 0;
    let current_class = Upgrader.getClassFromVersion(
      className,
      current_version,
    );
    let effective_class;
    while (current_class) {
      effective_class = current_class;
      current_version++;
      current_class = Upgrader.getClassFromVersion(className, current_version);
    }

    return effective_class.serialise(domain);
  }

  private static getClassFromVersion(
    className: SerialisableDomain,
    version: number,
  ) {
    const target_name = className.concat('_v', version.toString());
    return CLASS_DICTIONNARY[target_name];
  }

  private static convertAllDateAttributes(obj) {
    for (var key in obj) {
      if (typeof obj[key] == 'object' && obj[key] !== null) {
        Upgrader.convertAllDateAttributes(obj[key]);
      } else {
        if (!obj.hasOwnProperty(key)) {
          continue;
        } else {
          if (DATE_REGEXP.test(obj[key])) {
            obj[key] = new Date(obj[key]);
          }
        }
      }
    }
  }
}
