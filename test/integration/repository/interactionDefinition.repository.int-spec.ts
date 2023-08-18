import { TestUtil } from '../../TestUtil';
import { InteractionDefinitionRepository } from '../../../src/infrastructure/repository/interactionDefinition.repository';

describe('InteractionDefinitionRepository', () => {
  let interactionCatalogRepository = new InteractionDefinitionRepository(
    TestUtil.prisma,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('getAll : récupère tout ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', { id: '1' });
    await TestUtil.create('interactionDefinition', { id: '2' });
    await TestUtil.create('interactionDefinition', { id: '3' });

    // WHEN
    const liste = await interactionCatalogRepository.getAll();

    //THEN
    expect(liste).toHaveLength(3);
  });
  it('createOrUpdateInteractionDefinition : inserts properly ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition');
    // WHEN
    await interactionCatalogRepository.createOrUpdateInteractionDefinition(
      TestUtil.interactionDefinitionData({ id: '2' }),
    );

    //THEN
    const interacionsDB = await TestUtil.prisma.interactionDefinition.findMany(
      {},
    );
    expect(interacionsDB).toHaveLength(2);
  });
  it('createOrUpdateInteractionDefinition : update properly ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition');

    const updateInteraction = TestUtil.interactionDefinitionData({
      titre: 'le nouveau titre',
    });

    // WHEN
    await interactionCatalogRepository.createOrUpdateInteractionDefinition(
      updateInteraction,
    );

    //THEN
    const interacionsDB = await TestUtil.prisma.interactionDefinition.findMany(
      {},
    );
    expect(interacionsDB).toHaveLength(1);
    expect(interacionsDB[0].titre).toEqual('le nouveau titre');
  });
});
