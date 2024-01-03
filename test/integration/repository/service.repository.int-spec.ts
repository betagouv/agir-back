import { TestUtil } from '../../TestUtil';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';
import { ScheduledService } from '../../../src/domain/service/serviceDefinition';

async function injectData() {
  await TestUtil.create('utilisateur', { id: 'u1', email: '1' });
  await TestUtil.create('utilisateur', { id: 'u2', email: '2' });
  await TestUtil.create('utilisateur', { id: 'u3', email: '3' });

  await TestUtil.create('serviceDefinition', { id: 'sd1' });
  await TestUtil.create('serviceDefinition', { id: 'sd2' });
  await TestUtil.create('serviceDefinition', { id: 'sd3' });
  await TestUtil.create('serviceDefinition', { id: 'sd4' });

  await TestUtil.create('service', {
    id: 's1',
    utilisateurId: 'u1',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create('service', {
    id: 's2',
    utilisateurId: 'u1',
    serviceDefinitionId: 'sd2',
  });
  await TestUtil.create('service', {
    id: 's3',
    utilisateurId: 'u2',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create('service', {
    id: 's4',
    utilisateurId: 'u3',
    serviceDefinitionId: 'sd1',
  });
  await TestUtil.create('service', {
    id: 's5',
    utilisateurId: 'u3',
    serviceDefinitionId: 'sd2',
  });
  await TestUtil.create('service', {
    id: 's6',
    utilisateurId: 'u2',
    serviceDefinitionId: 'sd3',
  });
}

describe('ServiceRepository', () => {
  let serviceRepository = new ServiceRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
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
    await TestUtil.create('serviceDefinition', {
      id: 'linky',
      scheduled_refresh: null,
      minute_period: null,
    });
    await TestUtil.create('serviceDefinition', {
      id: 'ecowatt',
      scheduled_refresh: new Date(Date.now() - 1000),
    });
    await TestUtil.create('serviceDefinition', {
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
    await TestUtil.create('serviceDefinition', {
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
});
