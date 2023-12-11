export enum Feature {
  aides = 'aides',
  services = 'services',
  recommendations = 'recommendations',
}
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

  public unlock?(feature: Feature) {
    if (!this.unlocked_feature_list.includes(feature)) {
      this.unlocked_feature_list.push(feature);
    }
  }

  public getUnlockedList?(): Feature[] {
    return this.unlocked_feature_list;
  }
}
