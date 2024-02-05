import { Feature } from './feature';

export class UnlockedFeaturesData {
  unlocked_feature_list?: Feature[];
}
export class UnlockedFeatures extends UnlockedFeaturesData {
  constructor(data?: UnlockedFeatures) {
    super();
    if (data) {
      Object.assign(this, data);
    }
    if (!this.unlocked_feature_list) {
      this.unlocked_feature_list = [];
    }
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
