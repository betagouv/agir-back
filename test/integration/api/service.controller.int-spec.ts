import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/thematique';
import { TestUtil } from '../../TestUtil';

describe('Service (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /services listes 2 def', async () => {
    // GIVEN
    await TestUtil.create('serviceDefinition', { id: 'dummy_live' });
    await TestUtil.create('serviceDefinition', { id: 'dummy_scheduled' });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /services listes 1 def with correct date', async () => {
    // GIVEN
    await TestUtil.create('serviceDefinition', { is_local: false });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('dummy_live');
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].url).toEqual('url');
    expect(response.body[0].is_installed).toBeUndefined();
    expect(response.body[0].icon_url).toEqual('icon_url');
    expect(response.body[0].image_url).toEqual('image_url');
    expect(response.body[0].is_local).toEqual(false);
    expect(response.body[0].is_url_externe).toEqual(true);
    expect(response.body[0].description).toEqual('desc');
    expect(response.body[0].sous_description).toEqual('sous desc');
    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /services avec les occurences d installation', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });

    await TestUtil.create('serviceDefinition');

    await TestUtil.create('service', {
      id: '1',
      utilisateurId: '1',
      serviceDefinitionId: 'dummy_live',
    });
    await TestUtil.create('service', {
      id: '2',
      utilisateurId: '2',
      serviceDefinitionId: 'dummy_live',
    });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.body[0].nombre_installation).toEqual(2);
  });
  it('GET /services?utilisateurId=XXX avec le flag d installation propre à l utilisateur ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });

    await TestUtil.create('serviceDefinition', { id: 'dummy_live' });
    await TestUtil.create('serviceDefinition', { id: 'dummy_scheduled' });

    await TestUtil.create('service', {
      id: '1',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: 'dummy_live',
    });
    await TestUtil.create('service', {
      id: '2',
      utilisateurId: '2',
      serviceDefinitionId: 'dummy_scheduled',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/services?utilisateurId=utilisateur-id',
    );

    // THEN
    expect(response.body[0].is_installed).toEqual(true);
    expect(response.body[1].is_installed).toEqual(false);
  });
  it('GET /services?utilisateurId=XXX erreur 403 si pas le bon user', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/services?utilisateurId=BAD');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /utilisateurs/id/services ajout un nouveau service à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: 'dummy_live',
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
      service_definition_id: 'dummy_live',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Le service d'id dummy_live est dejà associé à cet utilisateur`,
    );
  });
  it('DELETE /utilisateurs/id/services/id supprime un service associé à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service');

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/dummy_live',
    );

    // THEN
    expect(response.status).toBe(200);
    const dbServices = await TestUtil.prisma.service.findMany();
    expect(dbServices).toHaveLength(0);
  });
  it('GET /utilisateurs/id/services liste les services associés à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'dummy_live' });
    await TestUtil.create('serviceDefinition', { id: 'dummy_scheduled' });
    await TestUtil.create('service', {
      id: '1',
      serviceDefinitionId: 'dummy_live',
    });
    await TestUtil.create('service', {
      id: '2',
      serviceDefinitionId: 'dummy_scheduled',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /utilisateurs/id/services liste 1 services associés à l utilisateur, check data', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].id).toEqual('dummy_live');
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].url).toEqual('url');
    expect(response.body[0].icon_url).toEqual('icon_url');
    expect(response.body[0].image_url).toEqual('image_url');
    expect(response.body[0].is_local).toEqual(true);
    expect(response.body[0].is_url_externe).toEqual(true);
    expect(response.body[0].description).toEqual('desc');
    expect(response.body[0].sous_description).toEqual('sous desc');
    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /utilisateurs/id/services , label a pour valeur label des données dynamic live', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].label).toEqual('En construction 🚧🚧');
    expect(response.body[0].isInError).toEqual(false);
  });
  it('GET /utilisateurs/id/services , label a pour valeur titre pour les service non dynamic live', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'inconnu' });
    await TestUtil.create('service', { serviceDefinitionId: 'inconnu' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].label).toEqual('titre');
    expect(response.body[0].isInError).toEqual(false);
  });
  it('GET /utilisateurs/id/services renvoi le libellé de la thématique en base si existe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      thematiques: ['alimentation'],
    });
    await TestUtil.create('service');
    await TestUtil.create('thematique', {
      id_cms: 1,
      titre: 'THE ALIMENTATION',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].thematiques[0]).toEqual('THE ALIMENTATION');
  });
  it('GET /services renvoi le libellé de la thématique en base si existe', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      thematiques: ['alimentation'],
    });
    await TestUtil.create('thematique', {
      id_cms: 1,
      titre: 'THE ALIMENTATION',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].thematiques[0]).toEqual('THE ALIMENTATION');
  });
  it('POST /services/refreshDynamicData 401 si pas header authorization', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer().post(
      '/services/refreshDynamicData',
    );

    // THEN
    expect(response.status).toBe(401);
  });
  it('POST /services/refreshDynamicData 403 si mauvais token', async () => {
    // GIVEN
    TestUtil.token = 'bad';

    // WHEN
    const response = await TestUtil.POST('/services/refreshDynamicData');

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /services/refreshDynamicData appel ok, renvoie liste vide quand aucun service en base', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/services/refreshDynamicData');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('POST /services/refreshDynamicData appel ok, renvoie 1 quand 1 service cible, donnée mises à jour', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });

    // WHEN
    const response = await TestUtil.POST('/services/refreshDynamicData');

    // THEN
    const serviceDefDB = await TestUtil.prisma.serviceDefinition.findFirst();

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual('REFRESHED OK : dummy_scheduled');
    expect(serviceDefDB.dynamic_data['label']).toEqual('En construction 🚧');
    expect(
      Math.round(
        (serviceDefDB.scheduled_refresh.getTime() - Date.now()) / 1000,
      ),
    ).toEqual(30 * 60);
  });
  it('POST /services/refreshDynamicData puis GET /utilisateurs/id/services appel récupère les données calculées en schedule', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'dummy_scheduled',
      scheduled_refresh: new Date(Date.now() - 1000),
      minute_period: 30,
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'dummy_scheduled',
    });

    // WHEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.POST('/services/refreshDynamicData');

    await TestUtil.generateAuthorizationToken('utilisateur-id');
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].label).toEqual('En construction 🚧');
  });
  it('GET /utilisateurs/id/services pas d erreur si service non dynamic (comme le suivi transport)', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', {
      id: 'inconnu',
    });
    await TestUtil.create('service', {
      serviceDefinitionId: 'inconnu',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
});
