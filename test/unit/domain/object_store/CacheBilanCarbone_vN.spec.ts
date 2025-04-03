import { CacheBilanCarbone } from '../../../../src/domain/bilan/cacheBilanCarbone';
import { CacheBilanCarbone_v0 } from '../../../../src/domain/object_store/bilan/cacheBilanCarbone_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';

describe('CacheBilanCarbone_vN ', () => {
  it('build ok from empty', async () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.CacheBilanCarbone);

    // WHEN

    const domain = new CacheBilanCarbone(raw);
  });
  it('serialise <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new CacheBilanCarbone({
      version: 0,
      alimentation_kg: 1,
      consommation_kg: 2,
      logement_kg: 3,
      transport_kg: 4,
      total_kg: 5,
      updated_at: new Date(),
      est_bilan_complet: true,
    });

    // WHEN
    const raw = CacheBilanCarbone_v0.serialise(domain_start);

    const domain_end = new CacheBilanCarbone(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgrade <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new CacheBilanCarbone({
      version: 0,
      alimentation_kg: 1,
      consommation_kg: 2,
      logement_kg: 3,
      transport_kg: 4,
      total_kg: 5,
      updated_at: new Date(),
      est_bilan_complet: true,
    });

    // WHEN
    const raw = CacheBilanCarbone_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.CacheBilanCarbone,
    );

    const domain_end = new CacheBilanCarbone(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
