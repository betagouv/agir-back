import { CategorieRecherche } from '../../../../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/recherche/filtreRecherche';
import { AddressesRepository } from '../../../../src/infrastructure/repository/services_recherche/addresses.repository';
import { LongueVieObjetsRepository } from '../../../../src/infrastructure/repository/services_recherche/lvo/LongueVieObjets.repository';
import { TestUtil } from '../../../TestUtil';

describe('LongueVieObjetsRepository', () => {
  const OLD_ENV = process.env;
  let longueVieObjetsRepository = new LongueVieObjetsRepository(
    new AddressesRepository(),
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('searchsearch : default', async () => {
    // GIVEN

    // WHEN
    const liste = await longueVieObjetsRepository.find(
      new FiltreRecherche({
        point: { latitude: 48, longitude: 2 },
        categorie: CategorieRecherche.emprunter,
      }),
    );

    // THEN
    expect(liste).toHaveLength(10);
  });
});
