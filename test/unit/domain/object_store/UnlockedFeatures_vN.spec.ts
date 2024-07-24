import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import { Feature } from '../../../../src/domain/gamification/feature';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { UnlockedFeatures_v0 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';

describe('UnlockedFeatures_vN ', () => {
  it('build ok from empty', async () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.UnlockedFeatures);

    // WHEN

    const domain = new UnlockedFeatures(raw);
    domain.add(Feature.aides);
    // THEN

    expect(domain.unlocked_features.includes(Feature.aides)).toEqual(true);
  });
  it('serialise <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new UnlockedFeatures();
    domain_start.add(Feature.bibliotheque);

    // WHEN
    const raw = UnlockedFeatures_v1.serialise(domain_start);

    const domain_end = new UnlockedFeatures(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgrade <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new UnlockedFeatures();
    domain_start.add(Feature.bibliotheque);

    // WHEN
    const raw = UnlockedFeatures_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.UnlockedFeatures,
    );

    const domain_end = new UnlockedFeatures(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
