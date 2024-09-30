import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/recherche/filtreRecherche';
import { ModeDeplacement } from '../../../../src/domain/bibliotheque_services/types/modeDeplacement';
import { DistancesRepository } from '../../../../src/infrastructure/repository/services_recherche/distances.repository';
import { TestUtil } from '../../../TestUtil';

describe('DistancesRepository', () => {
  const OLD_ENV = process.env;
  let distancesRepository = new DistancesRepository();

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

  it('searchsearch : distance à pied', async () => {
    // GIVEN

    // WHEN
    const liste = await distancesRepository.find(
      new FiltreRecherche({
        rect_A: {
          latitude: 48.70367966010218,
          longitude: 2.2070299356648193,
        },
        rect_B: {
          latitude: 48.70982333858675,
          longitude: 2.2109083863527776,
        },
        mode_deplacement: ModeDeplacement.pieds,
      }),
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].distance_metres).toEqual(1141);
  });
  it('searchsearch : distance à vélo', async () => {
    // GIVEN

    // WHEN
    const liste = await distancesRepository.find(
      new FiltreRecherche({
        rect_A: {
          latitude: 48.70367966010218,
          longitude: 2.2070299356648193,
        },
        rect_B: {
          latitude: 48.70982333858675,
          longitude: 2.2109083863527776,
        },
        mode_deplacement: ModeDeplacement.velo,
      }),
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].distance_metres).toEqual(2288);
  });
  it('searchsearch : distance en voiture', async () => {
    // GIVEN

    // WHEN
    const liste = await distancesRepository.find(
      new FiltreRecherche({
        rect_A: {
          latitude: 48.70367966010218,
          longitude: 2.2070299356648193,
        },
        rect_B: {
          latitude: 48.70982333858675,
          longitude: 2.2109083863527776,
        },
        mode_deplacement: ModeDeplacement.voiture,
      }),
    );

    // THEN
    expect(liste).toHaveLength(1);
    expect(liste[0].distance_metres).toEqual(2779);
  });
});
