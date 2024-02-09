import { UnlockedFeatures } from '../../../domain/gamification/unlockedFeatures';
import { Feature } from '../../../domain/gamification/feature';
import { SelfUpgrader } from '../selfUpgrader';
import { Translator } from '../translator';
import { Versioned } from '../versioned';

export class Serialised_UnlockedFeatures implements Versioned {
  static CURRENT_VERSION = 2;

  version: number;
  unlocked_feature_list: Feature[];

  static serialiseFromDomain(
    domain: UnlockedFeatures,
  ): Serialised_UnlockedFeatures {
    return {
      version: this.CURRENT_VERSION,
      unlocked_feature_list: domain.unlocked_feature_list,
    };
  }

  static translators(): Translator[] {
    return [
      {
        source_version: 1,
        target_version: 2,
        translate_function: (obj) => {
          obj.version = 2;
        },
      },
    ];
  }

  public static async deSerialise(raw: object): Promise<UnlockedFeatures> {
    return await this.DESERIALISER.toDomain(raw);
  }

  private static DESERIALISER = new SelfUpgrader<any>(
    Serialised_UnlockedFeatures.translators(),
    UnlockedFeatures,
  );
}
