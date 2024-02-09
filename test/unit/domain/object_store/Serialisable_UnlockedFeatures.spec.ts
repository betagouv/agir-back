import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import { Feature } from '../../../../src/domain/gamification/feature';
import { Serialised_UnlockedFeatures } from '../../../../src/infrastructure/object_store/catalogue/serialisable_UnlockedFeatures';

describe('Serialisable_UnlockedFeatures ', () => {
  it('constructeur OK - build from domain', () => {
    // GIVEN
    const unlockF = UnlockedFeatures.buildDefault();
    // WHEN
    const serialisable_UnlockedFeatures =
      Serialised_UnlockedFeatures.serialiseFromDomain(unlockF);

    // THEN
    expect(serialisable_UnlockedFeatures.version).toEqual(2);
  });
  it('constructeur OK - build from domain #2', () => {
    // GIVEN
    const unlockF = new UnlockedFeatures({
      version: 1,
      unlocked_feature_list: [Feature.bibliotheque],
    });
    // WHEN
    const result = Serialised_UnlockedFeatures.serialiseFromDomain(unlockF);

    // THEN
    expect(result['version']).toEqual(2);
  });
  it('toDomain() upgrades', async () => {
    // GIVEN
    const raw = {
      version: 1,
      unlocked_feature_list: ['bibliotheque'],
    };

    // WHEN
    const result = await Serialised_UnlockedFeatures.deSerialise(raw);

    // THEN
    expect(result.getUnlockedFeatures()).toEqual([Feature.bibliotheque]);
  });
});
