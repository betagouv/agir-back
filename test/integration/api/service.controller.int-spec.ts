import { TestUtil } from '../../TestUtil';

describe('Service (API test)', () => {
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
    expect(response.body[0].is_url_externe).toEqual(true);
  });
  it('POST /utilisateurs/id/services ajout un nouveau service à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: 'serviceDefinition-id',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
      include: {
        services: true,
      },
    });
    expect(dbUser['services']).toHaveLength(1);
  });
  it('POST /utilisateurs/id/services erreur si service definition non connue', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: 'bad_id',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Le service d'id bad_id n'existe pas`,
    );
  });
  it('POST /utilisateurs/id/services erreur si service dejà associé', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: 'serviceDefinition-id',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Le service d'id serviceDefinition-id est dejà associé à cet utilisateur`,
    );
  });
});
