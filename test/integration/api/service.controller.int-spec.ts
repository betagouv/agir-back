import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/thematique';
import { TestUtil } from '../../TestUtil';

describe('Service (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

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
    await TestUtil.create('serviceDefinition', { is_local: false });

    // WHEN
    const response = await TestUtil.GET('/services');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('serviceDefinition-id');
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].url).toEqual('url');
    expect(response.body[0].is_installed).toBeUndefined();
    expect(response.body[0].icon_url).toEqual('icon_url');
    expect(response.body[0].image_url).toEqual('image_url');
    expect(response.body[0].is_local).toEqual(false);
    expect(response.body[0].is_url_externe).toEqual(true);
    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('GET /services avec les occurences d installation', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });

    await TestUtil.create('serviceDefinition', { id: '1' });

    await TestUtil.create('service', {
      id: '1',
      utilisateurId: '1',
      serviceDefinitionId: '1',
    });
    await TestUtil.create('service', {
      id: '2',
      utilisateurId: '2',
      serviceDefinitionId: '1',
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

    await TestUtil.create('serviceDefinition', { id: '1' });
    await TestUtil.create('serviceDefinition', { id: '2' });

    await TestUtil.create('service', {
      id: '1',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: '1',
    });
    await TestUtil.create('service', {
      id: '2',
      utilisateurId: '2',
      serviceDefinitionId: '2',
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
  it('DELETE /utilisateurs/id/services/id supprime un service associé à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition');
    await TestUtil.create('service');

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/services/serviceDefinition-id',
    );

    // THEN
    expect(response.status).toBe(200);
    const dbServices = await TestUtil.prisma.service.findMany();
    expect(dbServices).toHaveLength(0);
  });
  it('GET /utilisateurs/id/services liste les services associés à l utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('serviceDefinition', { id: '1' });
    await TestUtil.create('serviceDefinition', { id: '2' });
    await TestUtil.create('service', { id: '1', serviceDefinitionId: '1' });
    await TestUtil.create('service', { id: '2', serviceDefinitionId: '2' });

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
    expect(response.body[0].id).toEqual('serviceDefinition-id');
    expect(response.body[0].label).toEqual('titre'); // FIXME :temp value
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].url).toEqual('url');
    expect(response.body[0].icon_url).toEqual('icon_url');
    expect(response.body[0].image_url).toEqual('image_url');
    expect(response.body[0].is_local).toEqual(true);
    expect(response.body[0].is_url_externe).toEqual(true);
    expect(response.body[0].thematiques).toStrictEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
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
  it('POST /services/refreshDynamicData appel ok, renvoie 0', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/services/refreshDynamicData');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.refreshed_services).toEqual(0);
  });
});
