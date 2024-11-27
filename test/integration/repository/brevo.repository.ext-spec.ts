import { BrevoRepository } from '../../../src/infrastructure/contact/brevoRepository';
import { TestUtil } from '../../TestUtil';

describe('ImpactTransportRepository', () => {
  const OLD_ENV = process.env;
  let brevoRepository = new BrevoRepository();

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

  it('getContactCreationDate : true', async () => {
    // GIVEN

    // WHEN
    const result = await brevoRepository.getContactCreationDate('haho@dev.com');

    // THEN
    expect(result).toEqual(new Date('2024-04-26T11:59:55.562+02:00'));
  });
  it('getContactCreationDate : false', async () => {
    // GIVEN

    // WHEN
    const result = await brevoRepository.getContactCreationDate('nawak.com');

    // THEN
    expect(result).toEqual(null);
  });
});
