import { InteractionDistribution } from '../../../src/domain/interaction/interactionDistribution';
import { InteractionPlacement } from '../../../src/domain/interaction/interactionPosition';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { DistributionSettings } from '../../../src/domain/interaction/distributionSettings';
import { TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/thematique';
import { Decimal } from '@prisma/client/runtime/library';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';

describe('/utilisateurs/id/interactions (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    DistributionSettings.overrideSettings(new Map([]));
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterEach(() => {
    DistributionSettings.resetSettings();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/interactions - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/autre-id/interactions');
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/interactions - list all interactions', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );
    // THEN
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
  it('GET /utilisateurs/id/interactions - list all interactions, filtée par code postal', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { code_postal: '123' });
    await TestUtil.create('interaction', {
      id: '1',
      codes_postaux: ['123'],
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '2',
      codes_postaux: ['456'],
      type: InteractionType.article,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );
    // THEN
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('1');
  });
  it('GET /utilisateurs/id/interactions - list interactions in reco order when no strategy', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { id: '1', score: 0.9 });
    await TestUtil.create('interaction', { id: '2', score: 0.2 });
    await TestUtil.create('interaction', { id: '3', score: 0.3 });
    await TestUtil.create('interaction', { id: '4', score: 0.1 });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].score).toEqual(0.9);
    expect(response.body[1].score).toEqual(0.3);
    expect(response.body[2].score).toEqual(0.2);
    expect(response.body[3].score).toEqual(0.1);
  });
  it('GET /utilisateurs/id/interactions - list interactions with strategy, correct order', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      score: 0.9,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.2,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '3',
      score: 0.5,
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '4',
      score: 0.1,
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].score).toEqual(0.9);
    expect(response.body[1].score).toEqual(0.5);
    expect(response.body[2].score).toEqual(0.2);
    expect(response.body[3].score).toEqual(0.1);
  });
  it('GET /utilisateurs/id/interactions - list interactions with strategy, max per type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      score: 0.9,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.2,
      type: InteractionType.aide,
    });
    await TestUtil.create('interaction', {
      id: '3',
      score: 0.5,
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: '4',
      score: 0.1,
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].score).toEqual(0.9);
    expect(response.body[1].score).toEqual(0.5);
  });
  it('GET /utilisateurs/id/interactions - no done interaction', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { done: true });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/interactions - pinned interaction at proper position', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { id: 'id-1', score: 0.9 });
    await TestUtil.create('interaction', { id: 'id-2', score: 0.5 });
    await TestUtil.create('interaction', { id: 'id-3', score: 0.2 });
    await TestUtil.create('interaction', {
      id: 'pin',
      score: 0.1,
      pinned_at_position: 2,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].id).toEqual('id-1');
    expect(response.body[1].id).toEqual('id-2');
    expect(response.body[2].id).toEqual('pin');
    expect(response.body[3].id).toEqual('id-3');
  });
  it('PATCH /utilisateurs/id/interactions/id - patch status of single interaction', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/interactions/interaction-id',
    ).send({
      done: true,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbInteraction.done).toStrictEqual(true);
    expect(dbInteraction.clicked).toStrictEqual(false);
    expect(dbInteraction.seen).toStrictEqual(0);
    expect(dbUtilisateur.gamification['points']).toStrictEqual(15);
  });
  it('PATCH /utilisateurs/id/interactions/id - does not change level when not reached', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 85,
      done: true,
      done_at: new Date(1),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '2',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 90,
      done: true,
      done_at: new Date(100),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '3',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 75,
      done: false,
      done_at: null,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/interactions/3',
    ).send({
      quizz_score: 45,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const dbBadges = await TestUtil.prisma.badge.findMany();
    expect(dbUtilisateur.quizzLevels['climat'].level).toStrictEqual(
      DifficultyLevel.L1,
    );
    expect(dbBadges.length).toEqual(1);
  });
  it('PATCH /utilisateurs/id/interactions/id - set a scheduled_reset date when moving to done and day_period specified', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: false,
      day_period: 1,
      scheduled_reset: null,
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/interactions/interaction-id',
    ).send({
      done: true,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.scheduled_reset).not.toBeNull();
  });
  it('PATCH /utilisateurs/id/interactions/id - set a scheduled_reset date when clicked then done and day_period specified', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: false,
      day_period: 1,
      scheduled_reset: null,
    });
    // WHEN
    await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/interactions/interaction-id',
    ).send({
      clicked: true,
    });
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/interactions/interaction-id',
    ).send({
      done: true,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.scheduled_reset).not.toBeNull();
  });
  it('POST /interactions/reset 403 when bad token', async () => {
    // GIVEN
    TestUtil.token = 'bad';
    // WHEN
    const response = await TestUtil.POST('/interactions/reset');
    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /interactions/reset 401 when missing authorization header', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer().post('/interactions/reset');
    // THEN
    expect(response.status).toBe(401);
  });
  it('POST /interactions/reset resets with current date when no date parameter', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
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
    // WHEN
    const response = await TestUtil.POST('/interactions/reset');
    // THEN
    const interactionDB = await TestUtil.prisma.interaction.findFirst();
    expect(response.status).toBe(200);
    expect(response.body.reset_interaction_number).toEqual(2);
    expect(interactionDB.done).toEqual(false);
  });
  it('GET /utilisateurs/id/interactions - list quizz with target utilisateur difficultys', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      quizzLevels: {
        alimentation: { level: 2, isCompleted: false },
        climat: { level: 1, isCompleted: false },
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      score: 0.9,
      type: InteractionType.quizz,
      difficulty: 1,
      thematique_gamification: Thematique.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.8,
      type: InteractionType.quizz,
      difficulty: 2,
      thematique_gamification: Thematique.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '3',
      score: 0.6,
      type: InteractionType.quizz,
      difficulty: 3,
      thematique_gamification: Thematique.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '4',
      score: 0.5,
      type: InteractionType.quizz,
      difficulty: 1,
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '5',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 2,
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '6',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 3,
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '7',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 3,
      thematique_gamification: Thematique.consommation,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].id).toEqual('2');
    expect(response.body[1].id).toEqual('4');
  });

  it('POST /interactions/scoring augmente le scoring OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      score: 0.1,
      thematique_gamification: Thematique.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.2,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/interactions/scoring?utilisateurId=utilisateur-id&thematique=climat&boost=4',
    );
    // THEN
    expect(response.status).toBe(201);
    const dbInter1 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '1' },
    });
    const dbInter2 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '2' },
    });
    expect(dbInter1.score).toEqual(new Decimal(0.1));
    expect(dbInter2.score).toEqual(new Decimal(0.8));
  });
  it('POST /interactions/scoring diminue le scoring OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      score: 0.8,
      thematique_gamification: Thematique.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.8,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/interactions/scoring?utilisateurId=utilisateur-id&thematique=climat&boost=-2',
    );
    // THEN
    expect(response.status).toBe(201);
    const dbInter1 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '1' },
    });
    const dbInter2 = await TestUtil.prisma.interaction.findUnique({
      where: { id: '2' },
    });
    expect(dbInter1.score).toEqual(new Decimal(0.8));
    expect(dbInter2.score).toEqual(new Decimal(0.4));
  });
});
