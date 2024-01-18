import { TestUtil } from '../../../TestUtil';

describe('Linky (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /linky_souscriptions renvoie une souscription', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.GET('/linky_souscriptions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.results[0].enedis_prm).toEqual('12345');
  });
});
