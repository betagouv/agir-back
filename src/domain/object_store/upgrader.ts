import { DefiHistory_v0 } from './defi/defiHistory_v0';
import { Gamification_v0 } from './gamification/gamification_v0';
import { History_v0 } from './history/history_v0';
import { KYCHistory_v0 } from './kyc/kycHistory_v0';
import { KYCHistory_v2 } from './kyc/kycHistory_v2';
import { KYCHistory_v1 } from './kyc/kycHistory_v1';
import { Logement_v0 } from './logement/logement_v0';
import { MissionsUtilisateur_v0 } from './mission/MissionsUtilisateur_v0';
import { MissionsUtilisateur_v1 } from './mission/MissionsUtilisateur_v1';
import { NotificationHistory_v0 } from './notification/NotificationHistory_v0';
import { ParcoursTodo_v0 } from './parcoursTodo/parcoursTodo_v0';
import { BibliothequeServices_v0 } from './service/BibliothequeService_v0';
import { UnlockedFeatures_v0 } from './unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from './unlockedFeatures/unlockedFeatures_v1';
import { ApplicationError } from '../../infrastructure/applicationError';

export enum SerialisableDomain {
  UnlockedFeatures = 'UnlockedFeatures',
  ParcoursTodo = 'ParcoursTodo',
  History = 'History',
  Gamification = 'Gamification',
  KYCHistory = 'KYCHistory',
  DefiHistory = 'DefiHistory',
  Logement = 'Logement',
  MissionsUtilisateur = 'MissionsUtilisateur',
  BibliothequeServices = 'BibliothequeServices',
  NotificationHistory = 'NotificationHistory',
  Object = 'Object',
}
const CLASS_DICTIONNARY = {
  UnlockedFeatures_v0: UnlockedFeatures_v0,
  UnlockedFeatures_v1: UnlockedFeatures_v1,
  ParcoursTodo_v0: ParcoursTodo_v0,
  History_v0: History_v0,
  Gamification_v0: Gamification_v0,
  KYCHistory_v0: KYCHistory_v0,
  KYCHistory_v1: KYCHistory_v1,
  KYCHistory_v2: KYCHistory_v2,
  Logement_v0: Logement_v0,
  DefiHistory_v0: DefiHistory_v0,
  MissionsUtilisateur_v0: MissionsUtilisateur_v0,
  MissionsUtilisateur_v1: MissionsUtilisateur_v1,
  BibliothequeServices_v0: BibliothequeServices_v0,
  NotificationHistory_v0: NotificationHistory_v0,
};

const DATE_REGEXP =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export class Upgrader {
  public static upgradeRaw(
    raw: any,
    className: SerialisableDomain,
    target_version = Number.MAX_SAFE_INTEGER,
  ): any {
    let current_version: number = raw['version'] || 0;
    current_version++; // starting from 1 or more

    let current_raw = raw;
    let current_class = Upgrader.getClassFromVersion(
      className,
      current_version,
    );

    while (current_class && current_version <= target_version) {
      current_raw = current_class.upgrade(current_raw);
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
    if (!domain) {
      return undefined;
    }
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
