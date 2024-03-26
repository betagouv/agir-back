import { DB, TestUtil } from '../../TestUtil';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';
import {
  LiveService,
  ScheduledService,
} from '../../../src/domain/service/serviceDefinition';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ServiceStatus } from '../../../src/domain/service/service';

async function injectData() {
  await TestUtil.create(DB.utilisateur, { id: 'u1', email: '1' });
  await TestUtil.create(DB.utilisateur, { id: 'u2', email: '2' });
  await TestUtil.create(DB.utilisateur, { id: 'u3', email: '3' });

  await TestUtil.create(DB.serviceDefinition, { id: 'sd1' });
  await TestUtil.create(DB.serviceDefinition, { id: 'sd2' });
  await TestUtil.create(DB.serviceDefinition, { id: 'sd3' });
  await TestUtil.create(DB.serviceDefinition, { id: 'sd4' });

  await TestUtil.create(DB.service, {
    id: 's1',
    utilisateurId: 'u1',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create(DB.service, {
    id: 's2',
    utilisateurId: 'u1',
    serviceDefinitionId: 'sd2',
  });
  await TestUtil.create(DB.service, {
    id: 's3',
    utilisateurId: 'u2',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create(DB.service, {
    id: 's4',
    utilisateurId: 'u3',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create(DB.service, {
    id: 's5',
    utilisateurId: 'u3',
    serviceDefinitionId: 'sd2',
  });
  await TestUtil.create(DB.service, {
    id: 's6',
    utilisateurId: 'u2',
    serviceDefinitionId: 'sd3',
  });
}

describe('ServiceRepository', () => {
  const OLD_ENV = process.env;
  let serviceRepository = new ServiceRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('listeServicesUsage  : renvoie le bon nbr d usage de chaque service', async () => {
    // GIVEN
    await injectData();

    // WHEN
    const result = await serviceRepository.countServiceDefinitionUsage();

    // THEN
    expect(result['sd1']).toEqual(3);
    expect(result['sd2']).toEqual(2);
    expect(result['sd3']).toEqual(1);
    expect(result['sd4']).toBeUndefined();
  });
  it('listeServiceDefinitionsAndUserRelatedServices  : renvoie le bon nbr d usage de chaque service', async () => {
    // GIVEN
    await injectData();

    // WHEN
    let result =
      await serviceRepository.listeServiceDefinitionsAndUserRelatedServices(
        null,
      );

    // THEN
    let id_count = result.map((def) => ({
      id: def.serviceDefinitionId,
      count: def.nombre_installation,
    }));
    expect(id_count).toStrictEqual([
      {
        id: 'sd1',
        count: 3,
      },
      {
        id: 'sd2',
        count: 2,
      },
      {
        id: 'sd3',
        count: 1,
      },
      {
        id: 'sd4',
        count: 0,
      },
    ]);
  });
  it('listeServiceDefinitionsAndUserRelatedServices  : flag d installation de service', async () => {
    // GIVEN
    await injectData();

    // WHEN
    let result =
      await serviceRepository.listeServiceDefinitionsAndUserRelatedServices(
        'u1',
      );

    // THEN
    expect(result).toHaveLength(4);
    expect(result[0].is_installed).toEqual(true);
    expect(result[1].is_installed).toEqual(true);
    expect(result[2].is_installed).toEqual(false);
    expect(result[3].is_installed).toEqual(false);
  });
  it('removeServiceFromUtilisateurByServiceDefinitionId  : removes only target service', async () => {
    // GIVEN
    await injectData();

    // WHEN
    await serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      'u1',
      'sd1',
    );

    // THEN
    const servicesDB = await TestUtil.prisma.service.findMany();
    const servicesDBU1 = await TestUtil.prisma.service.findMany({
      where: {
        utilisateurId: 'u1',
      },
    });

    expect(servicesDB).toHaveLength(5);
    expect(servicesDBU1).toHaveLength(1);
  });
  it('listeServiceDefinitionsToRefresh  : list services with date less than now', async () => {
    // GIVEN
    await TestUtil.create(DB.serviceDefinition, {
      id: 'linky',
      scheduled_refresh: null,
      minute_period: null,
    });
    await TestUtil.create(DB.serviceDefinition, {
      id: 'ecowatt',
      scheduled_refresh: new Date(Date.now() - 1000),
    });
    await TestUtil.create(DB.serviceDefinition, {
      id: 'recettes',
      scheduled_refresh: new Date(Date.now() + 10000),
    });

    // WHEN
    const servicesDBList =
      await serviceRepository.listeServiceDefinitionsToRefresh();

    // THEN
    expect(servicesDBList).toHaveLength(1);
    expect(servicesDBList[0].serviceDefinitionId).toEqual(
      ScheduledService.ecowatt,
    );
  });
  it('listeServiceDefinitionsToRefresh  : list service with no date but period', async () => {
    // GIVEN
    await TestUtil.create(DB.serviceDefinition, {
      id: 'ecowatt',
      scheduled_refresh: null,
      minute_period: 20,
    });

    // WHEN
    const servicesDBList =
      await serviceRepository.listeServiceDefinitionsToRefresh();

    // THEN
    expect(servicesDBList).toHaveLength(1);
    expect(servicesDBList[0].serviceDefinitionId).toEqual(
      ScheduledService.ecowatt,
    );
  });
  it('listeServicesOfUtilisateur  : get proper data', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.service, { configuration: { prm: '12345' } });

    // WHEN
    const servicesDBList = await serviceRepository.listeServicesOfUtilisateur(
      'utilisateur-id',
    );

    // THEN
    expect(servicesDBList).toHaveLength(1);
    expect(servicesDBList[0].serviceDefinitionId).toEqual(
      LiveService.dummy_live,
    );
    expect(servicesDBList[0].configuration).toEqual({ prm: '12345' });
    expect(servicesDBList[0].titre).toEqual('titre');
    expect(servicesDBList[0].url).toEqual('url');
    expect(servicesDBList[0].status).toEqual(ServiceStatus.CREATED);
    expect(servicesDBList[0].utilisateurId).toEqual('utilisateur-id');
    expect(servicesDBList[0].thematiques).toEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
  });
  it('updateServiceConfiguration  : saves conf ok', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.service, { configuration: {} });

    // WHEN
    await serviceRepository.updateServiceConfiguration(
      'utilisateur-id',
      'dummy_live',
      {
        a: '1',
        b: '2',
      },
    );

    // THEN
    const serviceDB = await TestUtil.prisma.service.findUnique({
      where: { id: 'service-id' },
    });
    expect(serviceDB.configuration).toEqual({
      a: '1',
      b: '2',
    });
  });
});
