import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { TestUtil } from '../../TestUtil';
import { ServiceStatus } from '../../../src/domain/service/service';

describe('Service (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.ADMIN_IDS = '';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
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
    process.env.SERVICES_ACTIFS = 'dummy_live';
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
    expect(response.body[0].en_construction).toEqual(false);
    expect(response.body[0].parametrage_requis).toEqual(true);
    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /services listes 1 def en construction', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = '';
    await TestUtil.create('serviceDefinition', { is_local: false });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].en_construction).toEqual(true);
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
  it('POST /utilisateurs/id/services ajoute un nouveau service async alors que le precedent est en cours de suppression', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.TO_DELETE,
      configuration: { prm: '123', winter_pk: 'abc' },
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/services',
    ).send({
      service_definition_id: 'linky',
    });

    // THEN
    expect(response.status).toBe(201);
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(serviceDB.status).toEqual(ServiceStatus.CREATED);
    expect(serviceDB.configuration).toEqual({ prm: '123', winter_pk: 'abc' });
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
  it('DELETE /utilisateurs/id/services/id supprime logiquement un service LIVE async ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.LIVE,
      configuration: { prm: '123', winter_pk: 'abc' },
    });

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/linky',
    );

    // THEN
    expect(response.status).toBe(200);
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(serviceDB.status).toEqual(ServiceStatus.TO_DELETE);
  });
  it('DELETE /utilisateurs/id/services/id supprime réellement un service CREATED async ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.CREATED,
      configuration: { prm: '123', winter_pk: 'abc' },
    });

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/linky',
    );

    // THEN
    expect(response.status).toBe(200);
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(serviceDB).toBeNull();
  });
  it('GET /utilisateurs/id/services liste les services associés à l utilisateur, ne liste pas les service TO_DELETE', async () => {
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
  it('GET /utilisateurs/id/services liste les services associés à l utilisateur, ne liste pas les service TO_DELETE', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'dummy_live' });
    await TestUtil.create('service', {
      status: ServiceStatus.TO_DELETE,
      id: '1',
      serviceDefinitionId: 'dummy_live',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/services liste 1 services associés à l utilisateur, check data', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = '';
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service', {
      configuration: { toto: '123', error_code: '456' },
    });

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
    expect(response.body[0].en_construction).toEqual(true);
    expect(response.body[0].configuration).toEqual({
      toto: '123',
      error_code: '456',
    });
    expect(response.body[0].label).toEqual(`En construction 🚧`);
    expect(response.body[0].error_code).toEqual('456');

    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /utilisateurs/id/services liste 1 services associés à l utilisateur, check data, actif', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = 'dummy_live';
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service', { configuration: { toto: '123' } });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].en_construction).toEqual(false);
  });
  it('GET /utilisateurs/id/services service actif si utilisateur est amin', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = '';
    process.env.ADMIN_IDS = 'utilisateur-id';
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service', { configuration: { toto: '123' } });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].en_construction).toEqual(false);
  });
  it('GET /utilisateurs/id/services/serviceID lit 1 unique services associés à l utilisateur, check data', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = 'dummy_live';

    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service', {
      configuration: { toto: '123', error_code: '456' },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services/dummy_live',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('dummy_live');
    expect(response.body.titre).toEqual('titre');
    expect(response.body.url).toEqual('url');
    expect(response.body.icon_url).toEqual('icon_url');
    expect(response.body.image_url).toEqual('image_url');
    expect(response.body.is_local).toEqual(true);
    expect(response.body.is_url_externe).toEqual(true);
    expect(response.body.description).toEqual('desc');
    expect(response.body.sous_description).toEqual('sous desc');
    expect(response.body.en_construction).toEqual(false);
    expect(response.body.error_code).toEqual('456');
    expect(response.body.configuration).toEqual({
      toto: '123',
      error_code: '456',
    });
    expect(response.body.label).toEqual(`En construction 🚧`);

    expect(response.body.thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /utilisateurs/id/services/serviceID lit 1 unique services flag de conf OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.LIVE,
      configuration: {
        prm: '123',
        winter_pk: 'abc',
        live_prm: '123',
      },
    });

    await TestUtil.create('linky', { prm: '123' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services/linky',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.is_configured).toEqual(true);
    expect(response.body.is_activated).toEqual(true);
    expect(response.body.is_fully_running).toEqual(true);
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
    expect(response.body[0].label).toEqual('En construction 🚧');
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
  });
  it('GET /utilisateurs/id/services , renvoie les flags d activation pour les service async #1', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.CREATED,
      configuration: {},
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].is_configured).toEqual(false);
    expect(response.body[0].is_activated).toEqual(false);
    expect(response.body[0].is_fully_running).toEqual(false);
  });
  it('GET /utilisateurs/id/services , renvoie les flags d activation pour les service async #2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.CREATED,
      configuration: { prm: '123', winter_pk: 'abc' },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].is_configured).toEqual(true);
    expect(response.body[0].is_activated).toEqual(false);
    expect(response.body[0].is_fully_running).toEqual(false);
  });
  it('GET /utilisateurs/id/services , renvoie les flags d activation pour les service async #3', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.CREATED,
      configuration: { prm: '123', winter_pk: 'abc', live_prm: '123' },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].is_configured).toEqual(true);
    expect(response.body[0].is_activated).toEqual(true);
    expect(response.body[0].is_fully_running).toEqual(false);
  });
  it('GET /utilisateurs/id/services , renvoie les flags d activation pour les service async #4', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.CREATED,
      configuration: {
        prm: '123',
        winter_pk: 'abc',
        live_prm: '123',
      },
    });
    await TestUtil.create('linky', { prm: '123' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].is_configured).toEqual(true);
    expect(response.body[0].is_activated).toEqual(true);
    expect(response.body[0].is_fully_running).toEqual(true);
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
  it('PUT /utilisateurs/id/services/serviceid/configuration OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'dummy_async' });
    await TestUtil.create('service', { serviceDefinitionId: 'dummy_async' });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/services/dummy_async/configuration',
    ).send({
      a: '123',
      b: 456,
      c: true,
    });

    // THEN
    expect(response.status).toBe(200);

    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });

    expect(serviceDB.configuration).toEqual({
      a: '123',
      b: 456,
      c: true,
    });
  });
  it('PUT /utilisateurs/id/services/serviceid/configuration KO pour linky, prm manquant', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', { serviceDefinitionId: 'linky' });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/services/linky/configuration',
    ).send({ a: '123' });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('PRM manquant');
  });
  it('PUT /utilisateurs/id/services/serviceid/configuration KO pour linky, prm au mauvais format', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', { serviceDefinitionId: 'linky' });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/services/linky/configuration',
    ).send({ prm: '123' });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais format de PRM : 123, nombre à 14 chiffres attendu',
    );
  });
  it('PUT /utilisateurs/id/services/serviceid/configuration OK pour linky', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: 'linky' });
    await TestUtil.create('service', { serviceDefinitionId: 'linky' });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/services/linky/configuration',
    ).send({ prm: '22293632381261' });

    // THEN
    const service = await TestUtil.prisma.service.findFirst({
      where: { utilisateurId: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(service.configuration['prm']).toEqual('22293632381261');
    expect(
      new Date(service.configuration['date_consent']).getTime(),
    ).toBeGreaterThan(Date.now() - 100);
    expect(
      new Date(service.configuration['date_consent']).getTime(),
    ).toBeLessThan(Date.now());

    const now_plus_3years = new Date();
    now_plus_3years.setFullYear(now_plus_3years.getFullYear() + 3);

    expect(
      new Date(service.configuration['date_fin_consent']).getTime(),
    ).toBeGreaterThan(now_plus_3years.getTime() - 100);
    expect(
      new Date(service.configuration['date_fin_consent']).getTime(),
    ).toBeLessThan(now_plus_3years.getTime());
  });
});
