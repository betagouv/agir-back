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

  it('findDepartementByCodePostal : renvoie 91 pour 91120', async () => {
    // WHEN
    const result = await departementRepository.findDepartementByCodePostal(
      '91120',
    );

    // THEN
    expect(result).toEqual('91');
  });
  it('findDepartementByCodePostal : renvoie 1 pour 01500', async () => {
    // WHEN
    const result = await departementRepository.findDepartementByCodePostal(
      '01500',
    );

    // THEN
    expect(result).toEqual('1');
  });
  it('findDepartementByCodePostal : renvoie 2A pour 20000 (Ajaccio)', async () => {
    // WHEN
    const result = await departementRepository.findDepartementByCodePostal(
      '20000',
    );

    // THEN
    expect(result).toEqual('2A');
  });
  it('findDepartementByCodePostal : renvoie 2B pour 20287 (Meria)', async () => {
    // WHEN
    const result = await departementRepository.findDepartementByCodePostal(
      '20287',
    );

    // THEN
    expect(result).toEqual('2B');
  });
});
