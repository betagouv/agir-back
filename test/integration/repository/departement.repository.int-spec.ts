import { TestUtil } from '../../TestUtil';
import { DepartementRepository } from '../../../src/infrastructure/repository/departement/departement.repository';

describe('DepartementRepository', () => {
  let departementRepository = new DepartementRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('findDepartementRegionByCodePostal : renvoie 91 pour 91120', async () => {
    // WHEN
    const result =
      await departementRepository.findDepartementRegionByCodePostal('91120');

    // THEN
    expect(result).toEqual({ code_departement: '91', code_region: '11' });
  });
  it('findDepartementRegionByCodePostal : renvoie 1 pour 01500', async () => {
    // WHEN
    const result =
      await departementRepository.findDepartementRegionByCodePostal('01500');

    // THEN
    expect(result).toEqual({ code_departement: '1', code_region: '82' });
  });
  it('findDepartementRegionByCodePostal : renvoie 2A pour 20000 (Ajaccio)', async () => {
    // WHEN
    const result =
      await departementRepository.findDepartementRegionByCodePostal('20000');

    // THEN
    expect(result).toEqual({ code_departement: '2A', code_region: '94' });
  });
  it('findDepartementRegionByCodePostal : renvoie 2B pour 20287 (Meria)', async () => {
    // WHEN
    const result =
      await departementRepository.findDepartementRegionByCodePostal('20287');

    // THEN
    expect(result).toEqual({
      code_departement: '2B',
      code_region: '94',
    });
  });
});
