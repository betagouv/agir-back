import { UnlockedFeatures } from '../../../../src/domain/gamification/unlockedFeatures';
import { Feature } from '../../../../src/domain/gamification/feature';
import { UnlockedFeatures_v0 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v0';
import { UnlockedFeatures_v1 } from '../../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';

describe('Upgrader ', () => {
  it('upgrade au max partant de data sans version', () => {
    // GIVEN
    const input = { unlocked_feature_list: [Feature.aides] };

    // WHEN
    const result = Upgrader.upgradeRaw(
      input,
      SerialisableDomain.UnlockedFeatures,
    );

    // THEN
    expect(result['unlocked_features']).toEqual([Feature.aides]);
    expect(result['version']).toEqual(1);
  });
  it('upgrade au max partant de data avec version 0', () => {
    // GIVEN
    const input: UnlockedFeatures_v0 = {
      unlocked_feature_list: [Feature.aides],
      version: 0,
    };

    // WHEN
    const result = Upgrader.upgradeRaw(
      input,
      SerialisableDomain.UnlockedFeatures,
    );

    // THEN
    expect(result['unlocked_features']).toEqual([Feature.aides]);
    expect(result['version']).toEqual(1);
  });
  it('upgrade de version 1 à version 1', () => {
    // GIVEN
    const input: UnlockedFeatures_v1 = {
      unlocked_features: [Feature.aides],
      version: 1,
    };

    // WHEN
    const result = Upgrader.upgradeRaw(
      input,
      SerialisableDomain.UnlockedFeatures,
    );

    // THEN
    expect(result['unlocked_features']).toEqual([Feature.aides]);
    expect(result['version']).toEqual(1);
  });
  it('serialise to last version', () => {
    // GIVEN
    const input = new UnlockedFeatures();
    input.add(Feature.bibliotheque);

    // WHEN
    const result = Upgrader.serialiseToLastVersion(
      input,
      SerialisableDomain.UnlockedFeatures,
    );

    // THEN
    expect(result['unlocked_features'].includes(Feature.bibliotheque)).toEqual(
      true,
    );
    expect(result['version']).toEqual(1);
  });
  it('convertAllDateAttributes converts date OK', () => {
    // GIVEN
    const input = {
      a: 'toto',
      b: true,
      c: 123,
      d: '2021-12-21T12:00:00.000Z',
    };

    // WHEN
    const result = Upgrader.upgradeRaw(input, SerialisableDomain.Object);

    // THEN
    expect(result.a).toEqual('toto');
    expect(result.b).toEqual(true);
    expect(result.c).toEqual(123);
    expect(result.d).toEqual(new Date('2021-12-21T12:00:00.000Z'));
  });
  it('convertAllDateAttributes converts date OK, recurrcively', () => {
    // GIVEN
    const input = {
      a: 'toto',
      b: true,
      c: 123,
      d: '2021-12-21T12:00:00.000Z',
      sub: {
        a: 'toto',
        b: true,
        c: 123,
        d: '2021-12-21T12:00:00.000Z',
      },
    };

    // WHEN
    const result = Upgrader.upgradeRaw(input, SerialisableDomain.Object);

    // THEN
    expect(result.a).toEqual('toto');
    expect(result.b).toEqual(true);
    expect(result.c).toEqual(123);
    expect(result.d).toEqual(new Date('2021-12-21T12:00:00.000Z'));
    expect(result.sub.a).toEqual('toto');
    expect(result.sub.b).toEqual(true);
    expect(result.sub.c).toEqual(123);
    expect(result.sub.d).toEqual(new Date('2021-12-21T12:00:00.000Z'));
  });
});
