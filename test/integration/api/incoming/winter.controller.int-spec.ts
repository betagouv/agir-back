import { TestUtil } from '../../../TestUtil';

describe('/api/incoming/winter-energies (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    TestUtil.token = process.env.CMS_WEBHOOK_API_KEY;
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /api/incoming/winter-energies - 200 par défaut', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/winter-energies')
      .send({ some: 'random' });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Received OK !');
  });
});
