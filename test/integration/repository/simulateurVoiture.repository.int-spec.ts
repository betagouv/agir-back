import { TestUtil } from '../../TestUtil';
import {
  SimulateurVoitureRepository,
  SimulateurVoitureParams,
} from '../../../src/infrastructure/repository/simulateurVoiture.repository';

describe('SimulateurVoitureRepository', () => {
  let simulateurVoitureRepository = new SimulateurVoitureRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  test('situation par défaut', async () => {
    // WHEN
    const result = await simulateurVoitureRepository.getResults({});

    // THEN
    expect(result.user.cost.value).toBeCloseTo(6370, 0);
    expect(result.user.cost.unit).toEqual('€/an');

    expect(result.user.emissions.value).toBeCloseTo(3022.8, 0);
    expect(result.user.emissions.unit).toEqual('kgCO2e/an');

    expect(result.user.size).toEqual({
      value: 'berline',
      title: 'Berline',
      isApplicable: true,
      isEnumValue: true,
    });
    expect(result.user.motorisation).toEqual({
      value: 'thermique',
      title: 'Thermique',
      isApplicable: true,
      isEnumValue: true,
    });
    expect(result.user.fuel).toEqual({
      value: 'essence E5 ou E10',
      title: 'Essence',
      isApplicable: true,
      isEnumValue: true,
    });
  });
});
