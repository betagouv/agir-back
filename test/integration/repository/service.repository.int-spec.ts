import { TestUtil } from '../../TestUtil';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';

async function injectData() {
  await TestUtil.create('utilisateur', { id: '1', email: '1' });
  await TestUtil.create('utilisateur', { id: '2', email: '2' });
  await TestUtil.create('utilisateur', { id: '3', email: '3' });

  await TestUtil.create('serviceDefinition', { id: '1' });
  await TestUtil.create('serviceDefinition', { id: '2' });
  await TestUtil.create('serviceDefinition', { id: '3' });
  await TestUtil.create('serviceDefinition', { id: '4' });

  await TestUtil.create('service', {
    id: '1',
    utilisateurId: '1',
    serviceDefinitionId: '1',
  });
  await TestUtil.create('service', {
    id: '2',
    utilisateurId: '1',
    serviceDefinitionId: '2',
  });
  await TestUtil.create('service', {
    id: '3',
    utilisateurId: '2',
    serviceDefinitionId: '1',
  });
  await TestUtil.create('service', {
    id: '4',
    utilisateurId: '3',
    serviceDefinitionId: '1',
  });
  await TestUtil.create('service', {
    id: '5',
    utilisateurId: '3',
    serviceDefinitionId: '2',
  });
  await TestUtil.create('service', {
    id: '6',
    utilisateurId: '2',
    serviceDefinitionId: '3',
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
    const result = await serviceRepository.countServicesByDefinition();

    // THEN
    expect(result['1']).toEqual(3);
    expect(result['2']).toEqual(2);
    expect(result['3']).toEqual(1);
    expect(result['4']).toBeUndefined();
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
        id: '1',
        count: 3,
      },
      {
        id: '2',
        count: 2,
      },
      {
        id: '3',
        count: 1,
      },
      {
        id: '4',
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
        '1',
      );

    // THEN
    expect(result).toHaveLength(4);
    expect(result[0].is_installed).toEqual(true);
    expect(result[1].is_installed).toEqual(true);
    expect(result[2].is_installed).toEqual(false);
    expect(result[3].is_installed).toEqual(false);
  });
});
