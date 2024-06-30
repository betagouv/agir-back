import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/filtreRecherche';
import { AddressesRepository } from '../../../../src/infrastructure/repository/services_recherche/addresses.repository';
import { TestUtil, DB } from '../../../TestUtil';

describe('AddressesRepository', () => {
  const OLD_ENV = process.env;
  let addressesRepository = new AddressesRepository();

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

  it('searchsearch : liste aide par code postal parmi plusieurs', async () => {
    // GIVEN

    // WHEN
    const liste = await addressesRepository.find(
      new FiltreRecherche({ text: '91120 PALAISEAU' }),
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].adresse_code_postal).toEqual('91120');
    expect(liste[0].adresse_nom_ville).toEqual('Palaiseau');
    expect(liste[0].longitude).toEqual(2.232499);
    expect(liste[0].latitude).toEqual(48.716454);
  });
});
