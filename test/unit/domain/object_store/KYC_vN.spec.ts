import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { KYC } from '../../../../src/domain/kyc/collectionQuestionsKYC';
import { KYC_v0 } from '../../../../src/domain/object_store/kyc/kyc_v0';

describe('KYC vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.KYC);

    // WHEN
    const domain = new KYC(raw);

    // THEN
    expect(domain.answered_questions).toHaveLength(0);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYC();
    domain_start.updateQuestion('1', ['oui', 'non']);

    // WHEN
    const raw = KYC_v0.serialise(domain_start);
    const domain_end = new KYC(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new KYC();
    domain_start.updateQuestion('1', ['oui', 'non']);

    // WHEN
    const raw = KYC_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.KYC);
    const domain_end = new KYC(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
