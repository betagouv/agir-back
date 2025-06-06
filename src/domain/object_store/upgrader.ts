import { CacheBilanCarbone_v0 } from './bilan/cacheBilanCarbone_v0';
import { Gamification_v0 } from './gamification/gamification_v0';
import { History_v0 } from './history/history_v0';
import { KYCHistory_v0 } from './kyc/kycHistory_v0';
import { KYCHistory_v1 } from './kyc/kycHistory_v1';
import { KYCHistory_v2 } from './kyc/kycHistory_v2';
import { Logement_v0 } from './logement/logement_v0';
import { NotificationHistory_v0 } from './notification/NotificationHistory_v0';
import { ProfileRecommandationUtilisateur_v0 } from './recommandation/ProfileRecommandationUtilisateur_v0';
import { BibliothequeServices_v0 } from './service/BibliothequeService_v0';
import { ThematiqueHistory_v0 } from './thematique/thematiqueHistory_v0';

export enum SerialisableDomain {
  History = 'History',
  Gamification = 'Gamification',
  KYCHistory = 'KYCHistory',
  Logement = 'Logement',
  BibliothequeServices = 'BibliothequeServices',
  NotificationHistory = 'NotificationHistory',
  ThematiqueHistory = 'ThematiqueHistory',
  CacheBilanCarbone = 'CacheBilanCarbone',
  ProfileRecommandationUtilisateur = 'ProfileRecommandationUtilisateur',
  Object = 'Object',
}
const CLASS_DICTIONNARY = {
  History_v0: History_v0,
  Gamification_v0: Gamification_v0,
  KYCHistory_v0: KYCHistory_v0,
  KYCHistory_v1: KYCHistory_v1,
  KYCHistory_v2: KYCHistory_v2,
  Logement_v0: Logement_v0,
  BibliothequeServices_v0: BibliothequeServices_v0,
  NotificationHistory_v0: NotificationHistory_v0,
  ThematiqueHistory_v0: ThematiqueHistory_v0,
  CacheBilanCarbone_v0: CacheBilanCarbone_v0,
  ProfileRecommandationUtilisateur_v0: ProfileRecommandationUtilisateur_v0,
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
