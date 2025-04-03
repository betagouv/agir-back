import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { KYCHistory_v0 } from '../../../../src/domain/object_store/kyc/kycHistory_v0';
import { KYCHistory_v2 } from '../../../../src/domain/object_store/kyc/kycHistory_v2';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';

describe('Upgrader ', () => {
  it('upgrade au max partant de data sans version', () => {
    // GIVEN
    const input = {
      answered_mosaics: [],
      answered_questions: [],
    };

    // WHEN
    const result = Upgrader.upgradeRaw(input, SerialisableDomain.KYCHistory);

    // THEN
    expect(result).toEqual({
      answered_mosaics: [],
      answered_questions: [],
      version: 2,
    });
    expect(result['version']).toEqual(2);
  });
  it('upgrade au max partant de data avec version 0', () => {
    // GIVEN
    const input: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };

    // WHEN
    const result = Upgrader.upgradeRaw(input, SerialisableDomain.KYCHistory);

    // THEN
    expect(result).toEqual({
      answered_mosaics: [],
      answered_questions: [],
      version: 2,
    });
    expect(result['version']).toEqual(2);
  });
  it('upgrade de version 1 à version 1', () => {
    // GIVEN
    const input: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [],
    };

    // WHEN
    const result = Upgrader.upgradeRaw(input, SerialisableDomain.KYCHistory);

    // THEN
    expect(result).toEqual({
      answered_mosaics: [],
      answered_questions: [],
      version: 2,
    });
    expect(result['version']).toEqual(2);
  });
  it('serialise to last version', () => {
    // GIVEN
    const input = new KYCHistory();

    // WHEN
    const result = Upgrader.serialiseToLastVersion(
      input,
      SerialisableDomain.KYCHistory,
    );

    // THEN
    expect(result).toEqual({
      answered_mosaics: [],
      answered_questions: [],
      version: 2,
    });
    expect(result['version']).toEqual(2);
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
