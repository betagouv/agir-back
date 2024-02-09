import { Serialised_UnlockedFeatures } from '../../../src/infrastructure/object_store/catalogue/serialisable_UnlockedFeatures';
import { Feature } from './feature';

export class UnlockedFeatures {
  unlocked_feature_list: Feature[];

  constructor(data: Serialised_UnlockedFeatures) {
    this.unlocked_feature_list = data.unlocked_feature_list;
  }

  public static buildDefault() {
    return new UnlockedFeatures({
      version: undefined,
      unlocked_feature_list: [],
    });
  }
  public add(feature: Feature) {
    if (!this.unlocked_feature_list.includes(feature)) {
      this.unlocked_feature_list.push(feature);
    }
  }

  public getUnlockedFeatures(): Feature[] {
    return this.unlocked_feature_list;
  }
}
