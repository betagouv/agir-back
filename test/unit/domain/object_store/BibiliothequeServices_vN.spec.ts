import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { BibliothequeServices } from '../../../../src/domain/bibliotheque_services/bibliothequeServices';
import { BibliothequeServices_v0 } from '../../../../src/domain/object_store/service/BibliothequeService_v0';
import { ServiceRechercheID } from '../../../../src/domain/bibliotheque_services/serviceRecherche';

describe('BibliothequeService vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw(
      {},
      SerialisableDomain.BibliothequeServices,
    );

    // WHEN

    const domain = new BibliothequeServices(raw);
    // THEN

    expect(domain.liste_services).toEqual([]);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new BibliothequeServices({
      version: 0,
      liste_services: [
        {
          id: ServiceRechercheID.proximite,
          favoris: [
            {
              date: new Date(),
              id: '123',
            },
          ],
        },
      ],
    });

    // WHEN
    const raw = BibliothequeServices_v0.serialise(domain_start);
    const domain_end = new BibliothequeServices(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new BibliothequeServices({
      version: 0,
      liste_services: [
        {
          id: ServiceRechercheID.proximite,
          favoris: [
            {
              date: new Date(),
              id: '123',
            },
          ],
        },
      ],
    });

    // WHEN
    const raw = BibliothequeServices_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.BibliothequeServices,
    );
    const domain_end = new BibliothequeServices(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});