import { UnlockedFeatures } from '../../gamification/unlockedFeatures';
import { Feature } from '../../gamification/feature';
import { Versioned } from '../versioned';

export class UnlockedFeatures_v0 extends Versioned {
  unlocked_feature_list: Feature[];

  static serialise(domain: UnlockedFeatures): UnlockedFeatures_v0 {
    return {
      version: 0,
      unlocked_feature_list: domain.unlocked_features,
    };
  }
}
