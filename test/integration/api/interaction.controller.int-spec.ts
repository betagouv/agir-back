import { InteractionDistribution } from '../../../src/domain/interaction/interactionDistribution';
import { InteractionPlacement } from '../../../src/domain/interaction/interactionPosition';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { DistributionSettings } from '../../../src/domain/interaction/distributionSettings';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/interactions (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    DistributionSettings.overrideSettings(new Map([]));
  });

  afterEach(() => {
    DistributionSettings.resetSettings();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/interactions - list all interactions', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(
      TestUtil.interactionData({
        created_at: dbInteraction.created_at.toISOString(),
        updated_at: dbInteraction.updated_at.toISOString(),
      }),
    );
  });
  it('GET /utilisateurs/id/interactions - list interactions in reco order when no strategy', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { id: '1', reco_score: 1 });
    await TestUtil.create('interaction', { id: '2', reco_score: 20 });
    await TestUtil.create('interaction', { id: '3', reco_score: 10 });
    await TestUtil.create('interaction', { id: '4', reco_score: 40 });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].reco_score).toEqual(1);
    expect(response.body[1].reco_score).toEqual(10);
    expect(response.body[2].reco_score).toEqual(20);
    expect(response.body[3].reco_score).toEqual(40);
  });
  it('GET /utilisateurs/id/interactions - list interactions with strategy, correct order', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      reco_score: 10,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '2',
      reco_score: 30,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '3',
      reco_score: 20,
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '4',
      reco_score: 40,
      type: InteractionType.article,
    });
    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(2, InteractionPlacement.any),
        ],
        [
          InteractionType.article,
          new InteractionDistribution(2, InteractionPlacement.any),
        ],
      ]),
    );

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].reco_score).toEqual(10);
    expect(response.body[1].reco_score).toEqual(20);
    expect(response.body[2].reco_score).toEqual(30);
    expect(response.body[3].reco_score).toEqual(40);
  });
  it('GET /utilisateurs/id/interactions - list interactions with strategy, max per type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      reco_score: 10,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '2',
      reco_score: 30,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '3',
      reco_score: 20,
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '4',
      reco_score: 40,
      type: InteractionType.article,
    });
    DistributionSettings.overrideSettings(
      new Map([
        [
          InteractionType.aide,
          new InteractionDistribution(1, InteractionPlacement.any),
        ],
        [
          InteractionType.article,
          new InteractionDistribution(1, InteractionPlacement.any),
        ],
      ]),
    );

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].reco_score).toEqual(10);
    expect(response.body[1].reco_score).toEqual(20);
  });
  it('GET /utilisateurs/id/interactions - no done interaction', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { done: true });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/interactions - no succeeded interaction', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { succeeded: true });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('PATCH /utilisateurs/id/interactions/id - patch status of single interaction', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        done: true,
      });
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbInteraction.done).toStrictEqual(true);
    expect(dbInteraction.clicked).toStrictEqual(false);
    expect(dbInteraction.succeeded).toStrictEqual(false);
    expect(dbInteraction.seen).toStrictEqual(0);
    expect(dbUtilisateur.points).toStrictEqual(5);
  });
  it('PATCH /utilisateurs/id/interactions/id - does not add points when already done', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: true,
    });
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        done: true,
      });
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.points).toStrictEqual(0);
  });
  it('PATCH /utilisateurs/id/interactions/id - set a scheduled_reset date when moving to done and day_period specified', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: false,
      day_period: 1,
    });
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        done: true,
      });
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.scheduled_reset).not.toBeNull();
  });
  it('POST /interactions/reset resets with current date when no date parameter', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      done: true,
      scheduled_reset: new Date(100),
    });
    await TestUtil.create('interaction', {
      id: '2',
      done: true,
      scheduled_reset: new Date(200),
    });
    const response = await TestUtil.getServer().post('/interactions/reset');
    expect(response.status).toBe(200);
    expect(response.body.reset_interaction_number).toEqual(2);
  });
  it('POST /interactions/reset resets with param date', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      done: true,
      scheduled_reset: new Date(100),
    });
    await TestUtil.create('interaction', {
      id: '2',
      done: true,
      scheduled_reset: new Date(200),
    });
    const response = await TestUtil.getServer().post(
      '/interactions/reset?date='.concat(new Date(150).toISOString()),
    );
    expect(response.status).toBe(200);
    expect(response.body.reset_interaction_number).toEqual(1);
  });
});
