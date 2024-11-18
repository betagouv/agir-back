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

  it('doesContactExists : true', async () => {
    // GIVEN

    // WHEN
    const result = await brevoRepository.doesContactExists('haho@dev.com');

    // THEN
    expect(result).toEqual(true);
  });
  it('doesContactExists : false', async () => {
    // GIVEN

    // WHEN
    const result = await brevoRepository.doesContactExists('nawak.com');

    // THEN
    expect(result).toEqual(false);
  });
});
