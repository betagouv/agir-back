import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/recherche/filtreRecherche';
import { DistancesRepository } from '../../../../src/infrastructure/repository/services_recherche/distances.repository';
import { ImpactTransportsRepository } from '../../../../src/infrastructure/repository/services_recherche/impactTransport.repository';
import { TestUtil } from '../../../TestUtil';

describe('ImpactTransportRepository', () => {
  const OLD_ENV = process.env;
  let impactTransportsRepository = new ImpactTransportsRepository(
    new DistancesRepository(),
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

  it('searchsearch : impact de 10km', async () => {
    // GIVEN

    // WHEN
    const liste = await impactTransportsRepository.find(
      new FiltreRecherche({
        distance_metres: 10000,
      }),
    );

    // THEN
    expect(liste).toHaveLength(20);
    expect(liste[0].id).toEqual('7');
    expect(liste[0].titre).toEqual('Vélo ou marche');
    expect(liste[0].impact_carbone_kg).toEqual(0);
    expect(liste[liste.length - 1].id).toEqual('4');
    expect(liste[liste.length - 1].titre).toEqual('Voiture thermique');
    expect(liste[liste.length - 1].impact_carbone_kg).toEqual(1.92);
  });
  it('searchsearch : impact avec 2 points GPS', async () => {
    // GIVEN

    // WHEN
    const liste = await impactTransportsRepository.find(
      new FiltreRecherche({
        rect_A: {
          latitude: 48.70367966010218,
          longitude: 2.2070299356648193,
        },
        rect_B: {
          latitude: 48.70982333858675,
          longitude: 2.2109083863527776,
        },
      }),
    );

    // THEN
    expect(liste[liste.length - 1].id).toEqual('4');
    expect(liste[liste.length - 1].titre).toEqual('Voiture thermique');
    expect(liste[liste.length - 1].impact_carbone_kg).toEqual(0.533568);
  });
});
