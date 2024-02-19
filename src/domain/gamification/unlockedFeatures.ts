import { UnlockedFeatures_v1 } from '../object_store/unlockedFeatures/unlockedFeatures_v1';
import { Feature } from './feature';

export class UnlockedFeatures {
  unlocked_features: Feature[];

  constructor(data?: UnlockedFeatures_v1) {
    if (data && data.unlocked_features) {
      this.unlocked_features = data.unlocked_features;
    } else {
      this.unlocked_features = [];
    }
  }

  public add?(feature: Feature) {
    if (!this.unlocked_features.includes(feature)) {
      this.unlocked_features.push(feature);
    }
  }

  public isUnlocked?(feature: Feature) {
    return this.unlocked_features.includes(feature);
  }

  public getUnlockedFeatures?(): Feature[] {
    return this.unlocked_features;
  }
}
