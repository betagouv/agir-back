import { ParcoursTodo_v0 } from './parcoursTodo/parcoursTodo_v0';
import { UnlockedFeatures_v0 } from './unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from './unlockedFeatures/unlockedFeatures_v1';

export enum SerialisableDomain {
  UnlockedFeatures = 'UnlockedFeatures',
  ParcoursTodo = 'ParcoursTodo',
  Object = 'Object',
}
const CLASS_DICTIONNARY = {
  UnlockedFeatures_v0: UnlockedFeatures_v0,
  UnlockedFeatures_v1: UnlockedFeatures_v1,
  ParcoursTodo_v0: ParcoursTodo_v0,
};

const DATE_REGEXP =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export class Upgrader {
  public static upgradeRaw(raw: any, className: SerialisableDomain): any {
    let current_version: number = raw['version'] || 0;

    current_version++;

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
