import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { DB, TestUtil } from '../../TestUtil';
import { ServiceStatus } from '../../../src/domain/service/service';

describe('Service (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.ADMIN_IDS = '';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('DELETE /utilisateurs/id/services/id supprime un service associé à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.service);

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/dummy_live',
    );

    // THEN
    expect(response.status).toBe(200);
    const dbServices = await TestUtil.prisma.service.findMany();
    expect(dbServices).toHaveLength(0);
  });
  it('DELETE /utilisateurs/id/services/id 404 si le service existe pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/dummy_live',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('DELETE /utilisateurs/id/services/id supprime logiquement un service LIVE async ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
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
  it('DELETE /utilisateurs/id/services/id renvoie une conf vide apres suppression logique de un service LIVE async ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
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

    // WHEN
    const response2 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services/linky',
    );

    // THEN
    expect(response2.status).toBe(200);
    expect(response2.body.configuration).toEqual({});
  });
  it('DELETE /utilisateurs/id/services/id supprime réellement un service CREATED async ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
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

  it('GET /utilisateurs/id/services/serviceID lit 1 unique services associés à l utilisateur, check data', async () => {
    // GIVEN
    process.env.SERVICES_ACTIFS = 'dummy_live';

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.service, {
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
    expect(response.body.error_code).toEqual('456');
    expect(response.body.en_construction).toEqual(false);
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
  it('GET /utilisateurs/id/services/bad-id renvoie 404 si service pas install pour utilsateur', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services/dummy',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.code).toEqual('038');
    expect(response.body.message).toEqual(
      `le service [dummy] n'est pas installé pour l'utilisateur`,
    );
  });
  it('GET /utilisateurs/id/services/bad-id renvoie 200 si service Linky pas install pour utilsateur (auto install)', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/services/linky',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('linky');
  });
  it('GET /utilisateurs/id/services/serviceID lit 1 unique services flag de conf OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      status: ServiceStatus.LIVE,
      configuration: {
        prm: '123',
        winter_pk: 'abc',
        live_prm: '123',
      },
    });

    await TestUtil.create(DB.linky, { prm: '123' });

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

  it('PUT /utilisateurs/id/services/serviceid/configuration KO pour linky, prm manquant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, { serviceDefinitionId: 'linky' });

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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, { serviceDefinitionId: 'linky' });

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
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: 'linky' });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: 'linky',
      configuration: { titi: 'yo' },
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/services/linky/configuration',
    ).send({ prm: '22293632381261', toto: 'haha' });

    // THEN
    const service = await TestUtil.prisma.service.findFirst({
      where: { utilisateurId: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(service.configuration['prm']).toEqual('22293632381261');
    expect(service.configuration['toto']).toEqual('haha');
    expect(service.configuration['titi']).toEqual('yo');
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
