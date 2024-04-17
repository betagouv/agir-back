import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import {
  Transport,
  TransportQuotidien,
} from '../../../../src/domain/transport/transport';
import { Transport_v0 } from '../../../../src/domain/object_store/transport/transport_v0';

describe('Transport vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.Transport);

    // WHEN
    new Transport(raw);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new Transport({
      version: 0,
      avions_par_an: 2,
      transports_quotidiens: [TransportQuotidien.moto, TransportQuotidien.pied],
    });

    // WHEN
    const raw = Transport_v0.serialise(domain_start);
    const domain_end = new Transport(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new Transport({
      version: 0,
      avions_par_an: 2,
      transports_quotidiens: [TransportQuotidien.moto, TransportQuotidien.pied],
    });

    // WHEN
    const raw = Transport_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Transport);
    const domain_end = new Transport(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
