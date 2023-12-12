import { Feature } from './feature';

export class UnlockedFeatures {
  constructor(data?: UnlockedFeatures) {
    if (data) {
      Object.assign(this, data);
    }
    if (!this.unlocked_feature_list) {
      this.unlocked_feature_list = [];
    }
  }
  private unlocked_feature_list: Feature[];

  public add?(feature: Feature) {
    if (!this.unlocked_feature_list.includes(feature)) {
      this.unlocked_feature_list.push(feature);
    }
  }

  public getUnlockedList?(): Feature[] {
    return this.unlocked_feature_list;
  }
}
