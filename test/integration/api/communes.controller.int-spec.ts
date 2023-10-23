import { TestUtil } from '../../TestUtil';

describe('/communes (API test)', () => {
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

  it('GET /communes?code_postal=XXXX - mauvais code postal renvoie liste vide', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=99999');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /communes?code_postal=XXXX - ville unique', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=91120');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('PALAISEAU');
  });
  it('GET /communes?code_postal=XXXX - ville double', async () => {
    // WHEN
    const response = await TestUtil.GET('/communes?code_postal=26290');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toStrictEqual(['DONZERE', 'LES GRANGES GONTARDES']);
  });
});
