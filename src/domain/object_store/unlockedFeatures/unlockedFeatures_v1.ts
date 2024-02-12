import { UnlockedFeatures } from '../../gamification/unlockedFeatures';
import { Feature } from '../../gamification/feature';
import { UnlockedFeatures_v0 } from './unlockedFeatures_v0';
import { Versioned } from '../versioned';

export class UnlockedFeatures_v1 extends Versioned {
  unlocked_features: Feature[];

  static serialise(domain: UnlockedFeatures): UnlockedFeatures_v1 {
    return {
      version: 1,
      unlocked_features: domain.unlocked_features,
    };
  }

  static upgrade(source: UnlockedFeatures_v0): UnlockedFeatures_v1 {
    return {
      version: 1,
      unlocked_features: source.unlocked_feature_list,
    };
  }
}
