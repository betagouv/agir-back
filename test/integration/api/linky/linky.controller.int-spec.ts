import { TestUtil } from '../../../TestUtil';

describe('Linky (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy

    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /linky/souscriptions renvoie une souscription', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.GET('/linky/souscriptions');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.results[0].enedis_prm).toEqual('12345');
  });
  it('GET /utilisateurs/id/linky renvoie tableau vide si pas de service', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/linky renvoie tableau vide si pas data linky', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/linky renvoie les ata linky', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      configuration: { prm: 'abc' },
    });
    await TestUtil.create('linky');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/linky');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].date).toEqual(new Date(123).toISOString());
    expect(response.body[0].valeur).toEqual(100);
    expect(response.body[0].valeur_corrigee).toEqual(110);
  });
});
