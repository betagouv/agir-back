import { Feature } from '../../../../src/domain/gamification/feature';
import { Serialisable_UnlockedFeatures } from '../../../../src/infrastructure/object_store/serialisable_UnlockedFeatures';

describe('Serialisable_UnlockedFeatures', () => {
  it('constructeur OK', () => {
    // WHEN
    const serialisable_UnlockedFeatures = new Serialisable_UnlockedFeatures({
      version: 1,
    });

    // THEN
    expect(serialisable_UnlockedFeatures.version).toEqual(1);
  });
  it('toDomain() upgrades', async () => {
    // GIVEN
    const serialisable_UnlockedFeatures = new Serialisable_UnlockedFeatures({
      version: 1,
      unlocked_feature_list: ['bibliotheque'],
    });

    // WHEN
    const result = await serialisable_UnlockedFeatures.toDomain();

    // THEN
    expect(serialisable_UnlockedFeatures.version).toEqual(2);
    expect(result.getUnlockedFeatures()).toEqual([Feature.bibliotheque]);
  });
});
