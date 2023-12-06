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

  it('POST /utilisateurs/id/linky_souscription renvoie 400 si deja une pk winter sur le compte', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { pk_winter: '1234' });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/linky_souscription?prm=abc&code_departement=91',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Il y a déjà une souscription linky pour cet utilisateur',
    );
  });
  it('POST /utilisateurs/id/linky_souscription sans prm', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/linky_souscription?code_departement=91',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('PRM manquant');
  });
  it('POST /utilisateurs/id/linky_souscription sans code departement', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/linky_souscription?prm=abc',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Code département manquant');
  });
  it('POST /utilisateurs/id/linky_souscription valorise la pk dans le compte, departement et prm', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/linky_souscription?prm=abc&code_departement=91',
    );

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const linky_prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(dbUser.pk_winter).toEqual('7614671637');
    expect(dbUser.prm).toEqual('abc');
    expect(dbUser.code_departement).toEqual('91');
    expect(linky_prm.data['serie']).toEqual([]);
  });
  it('POST /linky_souscriptions/:prm/empty vide les données stockées du PRM', async () => {
    // GIVEN
    await TestUtil.create('linky');

    // WHEN
    const response = await TestUtil.POST('/linky_souscriptions/abc/empty');

    // THEN
    expect(response.status).toBe(200);
    const linky_prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(linky_prm.data['serie']).toEqual([]);
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
