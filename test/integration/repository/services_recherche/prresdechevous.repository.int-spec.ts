import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/filtreRecherche';
import { AddressesRepository } from '../../../../src/infrastructure/repository/services_recherche/addresses.repository';
import { PresDeChezNousRepository } from '../../../../src/infrastructure/repository/services_recherche/pres_de_chez_nous/presDeChezNous.repository';
import { TestUtil, DB } from '../../../TestUtil';

describe('PresDeChezVousRepository', () => {
  const OLD_ENV = process.env;
  let presDeChezNousRepository = new PresDeChezNousRepository(
    new AddressesRepository(),
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('mapOpenHours : map correctement', async () => {
    // GIVEN

    // WHEN
    const openHours = await presDeChezNousRepository.mapOpenHours({
      Tu: '10:00-19:00',
      We: '10:00-19:00',
      Th: '10:00-19:00',
      Fr: '10:00-19:00',
      Sa: '10:00-19:00',
    } as any);

    // THEN
    expect(openHours).toStrictEqual([
      { heures: '10:00-19:00', jour: 'mardi' },
      { heures: '10:00-19:00', jour: 'mercredi' },
      { heures: '10:00-19:00', jour: 'jeudi' },
      { heures: '10:00-19:00', jour: 'vendredi' },
      { heures: '10:00-19:00', jour: 'samedi' },
    ]);
  });
});
