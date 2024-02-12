import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import { Feature } from '../../../../src/domain/gamification/feature';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { UnlockedFeatures_v0 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';

describe('UnlockedFeatures_vN ', () => {
  it('serialise <=> deSerialise v1 OK', async () => {
    // GIVEN
    const unlockF = new UnlockedFeatures();
    unlockF.add(Feature.bibliotheque);

    // WHEN
    const raw = UnlockedFeatures_v1.serialise(unlockF);

    const domain = new UnlockedFeatures(raw);

    // THEN
    expect(unlockF).toStrictEqual(domain);
  });
  it('serialise <=> upgrade <=> deSerialise v1 OK', async () => {
    // GIVEN
    const unlockF = new UnlockedFeatures();
    unlockF.add(Feature.bibliotheque);

    // WHEN
    const raw = UnlockedFeatures_v0.serialise(unlockF);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.UnlockedFeatures,
    );

    const domain = new UnlockedFeatures(upgrade);

    // THEN
    expect(unlockF).toStrictEqual(domain);
  });
});
