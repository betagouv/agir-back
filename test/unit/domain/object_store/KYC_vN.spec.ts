import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { KYCHistory } from '../../../../src/domain/kyc/kycHistory';
import { KYCHistory_v0 } from '../../../../src/domain/object_store/kyc/kycHistory_v0';

describe('KYC vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.KYCHistory);

    // WHEN
    const domain = new KYCHistory(raw);

    // THEN
    expect(domain.answered_questions).toHaveLength(0);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory();
    domain_start.updateQuestion('1', ['oui', 'non']);

    // WHEN
    const raw = KYCHistory_v0.serialise(domain_start);
    const domain_end = new KYCHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYCHistory();
    domain_start.updateQuestion('1', ['oui', 'non']);

    // WHEN
    const raw = KYCHistory_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.KYCHistory);
    const domain_end = new KYCHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
