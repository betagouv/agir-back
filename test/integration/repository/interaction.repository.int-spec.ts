import { TestUtil } from '../../TestUtil';
import { InteractionRepository } from '../../../src/infrastructure/repository/interaction.repository';
import { Interaction } from '../../../src/domain/interaction/interaction';

describe('InteractionRepository', () => {
  let interactionRepository = new InteractionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('listInteractionsByUtilisateurId : desc order by reco score ', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { id: '1', reco_score: 100 });
    await TestUtil.create('interaction', { id: '2', reco_score: 20 });
    await TestUtil.create('interaction', { id: '3', reco_score: 50 });

    const liste = await interactionRepository.listInteractionsByUtilisateurId(
      'utilisateur-id',
    );
    expect(liste).toHaveLength(3);
    expect(liste[0].reco_score).toEqual(20);
    expect(liste[1].reco_score).toEqual(50);
    expect(liste[2].reco_score).toEqual(100);
  });
  it('resetAllInteractionStatus : resets nothing when date after scheduled reset date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { scheduled_reset: new Date(100) });

    await interactionRepository.resetAllInteractionStatus(new Date(50));
    const result = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(result.done).toStrictEqual(false);
    expect(result.clicked).toStrictEqual(false);
    expect(result.succeeded).toStrictEqual(false);
  });
  it('resetAllInteractionStatus : resets nothing when no scheduled_reset date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { scheduled_reset: null, done: true });

    await interactionRepository.resetAllInteractionStatus(new Date(50));
    const result = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(result.done).toStrictEqual(true);
  });
  it('resetAllInteractionStatus : resets one only when date passed', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      scheduled_reset: new Date(100),
      done: true,
      clicked: true,
      succeeded: true,
      done_at: new Date(),
      clicked_at: new Date(),
      succeeded_at: new Date(),
    });
    await TestUtil.create('interaction', {
      id: '2',
      scheduled_reset: new Date(200),
      done: true,
      clicked: true,
      succeeded: true,
      done_at: new Date(),
      clicked_at: new Date(),
      succeeded_at: new Date(),
    });

    await interactionRepository.resetAllInteractionStatus(new Date(150));
    let inter1 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '1' },
    });
    let inter2 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '2' },
    });

    // THEN
    expect(inter1.done).toStrictEqual(false);
    expect(inter1.clicked).toStrictEqual(false);
    expect(inter1.succeeded).toStrictEqual(false);
    expect(inter1.done_at).toStrictEqual(null);
    expect(inter1.clicked_at).toStrictEqual(null);
    expect(inter1.succeeded_at).toStrictEqual(null);
    expect(inter1.scheduled_reset).toStrictEqual(null);
    expect(inter2.done).toStrictEqual(true);
    expect(inter2.clicked).toStrictEqual(true);
    expect(inter2.succeeded).toStrictEqual(true);
    expect(inter2.done_at).not.toBeNull();
    expect(inter2.clicked_at).not.toBeNull();
    expect(inter2.succeeded_at).not.toBeNull();
    expect(inter2.scheduled_reset).not.toBeNull();
  });
  it('update : update interaction and proper update_at date', async () => {
    //GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    const interactionToUpdate = new Interaction({
      points: 123,
      id: 'interaction-id',
    });

    //WHEN
    await interactionRepository.partialUpdateInteraction(interactionToUpdate);

    // THEN
    const result = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(result.categorie).toStrictEqual('Consommation');
    expect(result.points).toStrictEqual(123);
    expect(result.updated_at).not.toBeNull();
  });
});
