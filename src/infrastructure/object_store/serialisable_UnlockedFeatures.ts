import { UnlockedFeatures } from '../../../src/domain/gamification/unlockedFeatures';
import { Feature } from '../../domain/gamification/feature';
import { DomainMaker } from './domainMaker';
import { ObjectUpgrader } from './objectUpgrader';
import { Versioned } from './versioned';

export class Serialisable_UnlockedFeatures
  extends ObjectUpgrader
  implements DomainMaker<UnlockedFeatures>, Versioned
{
  version = 2;

  constructor(raw_data) {
    super();
    Object.assign(this, raw_data);
  }

  async toDomain(): Promise<UnlockedFeatures> {
    await this.upgrade(this);
    return new UnlockedFeatures({
      unlocked_feature_list: this.unlocked_feature_list,
    });
  }

  unlocked_feature_list?: Feature[];
}
