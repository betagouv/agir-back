import { TestUtil } from '../../TestUtil';

describe('/service (API test)', () => {
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

  it('GET /services listes 2 def', async () => {
    // GIVEN
    await TestUtil.create('serviceDefinition', { id: '1' });
    await TestUtil.create('serviceDefinition', { id: '2' });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /services listes 1 def with correct date', async () => {
    // GIVEN
    await TestUtil.create('serviceDefinition', { local: false });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].url).toEqual('url');
    expect(response.body[0].local).toEqual(false);
  });
});
