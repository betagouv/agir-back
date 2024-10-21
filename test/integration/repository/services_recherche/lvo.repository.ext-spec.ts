import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/recherche/filtreRecherche';
import { LongueVieObjetsRepository } from '../../../../src/infrastructure/repository/services_recherche/lvo/LongueVieObjets.repository';
import { TestUtil } from '../../../TestUtil';

describe('LongueVieObjetsRepository', () => {
  const OLD_ENV = process.env;
  let longueVieObjetsRepository = new LongueVieObjetsRepository();

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
    const liste = await longueVieObjetsRepository.find(new FiltreRecherche({}));

    // THEN
    expect(liste).toHaveLength(10);
  });
});
