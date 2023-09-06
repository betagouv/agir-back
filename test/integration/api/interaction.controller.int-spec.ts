import { InteractionDistribution } from '../../../src/domain/interaction/interactionDistribution';
import { InteractionPlacement } from '../../../src/domain/interaction/interactionPosition';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { DistributionSettings } from '../../../src/domain/interaction/distributionSettings';
import { TestUtil } from '../../TestUtil';
import { BadgeTypes } from '../../../src/domain/badge/badgeTypes';
import { Categorie } from '../../../src/domain/categorie';
import { Decimal } from '@prisma/client/runtime/library';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';

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
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction');
    // WHEN
    const response = await TestUtil.getServer().get(
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
        reco_score: 666,
      }),
    );
  });
  it('GET /utilisateurs/id/interactions - list interactions in reco order when no strategy', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { id: '1', score: 0.9 });
    await TestUtil.create('interaction', { id: '2', score: 0.2 });
    await TestUtil.create('interaction', { id: '3', score: 0.3 });
    await TestUtil.create('interaction', { id: '4', score: 0.1 });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].score).toEqual('0.9');
    expect(response.body[1].score).toEqual('0.3');
    expect(response.body[2].score).toEqual('0.2');
    expect(response.body[3].score).toEqual('0.1');
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
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].score).toEqual('0.9');
    expect(response.body[1].score).toEqual('0.5');
    expect(response.body[2].score).toEqual('0.2');
    expect(response.body[3].score).toEqual('0.1');
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
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/interactions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].score).toEqual('0.9');
    expect(response.body[1].score).toEqual('0.5');
  });
  it('GET /utilisateurs/id/interactions - no done interaction', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { done: true });
    // WHEN
    const response = await TestUtil.getServer().get(
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
    const response = await TestUtil.getServer().get(
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
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
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
    expect(dbUtilisateur.points).toStrictEqual(5);
  });
  it('PATCH /utilisateurs/id/interactions/id - win badge when first quizz score present', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { type: InteractionType.quizz });
    // WHEN
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        quizz_score: 55,
      });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
      include: {
        badges: true,
      },
    });
    expect(dbUtilisateur['badges']).toHaveLength(1);
    expect(dbUtilisateur['badges'][0].type).toEqual(
      BadgeTypes.premier_quizz.type,
    );
  });
  it('PATCH /utilisateurs/id/interactions/id - increase categorie level when success condition', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      id: '1',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 85,
      done: true,
      done_at: new Date(1),
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '2',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 90,
      done: true,
      done_at: new Date(100),
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '3',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 75,
      done: false,
      done_at: null,
      categorie: Categorie.climat,
    });
    // WHEN
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/3')
      .send({
        quizz_score: 79,
      });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const dbBadges = await TestUtil.prisma.badge.findMany({
      orderBy: {
        created_at: 'asc',
      },
    });

    expect(dbUtilisateur.quizzLevels['climat'].level).toStrictEqual(
      DifficultyLevel.L2,
    );
    expect(dbBadges.length).toEqual(2);
    expect(dbBadges[0].titre).toStrictEqual('1er quizz réussi !');
    expect(dbBadges[1].titre).toStrictEqual(
      'Niveau 1 en catégorie climat réussi !!',
    );
    expect(dbBadges[1].type).toStrictEqual('climat_1');
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
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '2',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 90,
      done: true,
      done_at: new Date(100),
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '3',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 75,
      done: false,
      done_at: null,
      categorie: Categorie.climat,
    });
    // WHEN
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/3')
      .send({
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
  it('PATCH /utilisateurs/id/interactions/id - does not add points when already done', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: true,
    });
    // WHEN
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        done: true,
      });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.points).toStrictEqual(0);
  });
  it('PATCH /utilisateurs/id/interactions/id - set a scheduled_reset date when moving to done and day_period specified', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: false,
      day_period: 1,
    });
    // WHEN
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/interactions/interaction-id')
      .send({
        done: true,
      });
    // THEN
    expect(response.status).toBe(200);
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.scheduled_reset).not.toBeNull();
  });
  it('POST /interactions/reset resets with current date when no date parameter', async () => {
    // GIVEN
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
    const response = await TestUtil.getServer().post('/interactions/reset');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.reset_interaction_number).toEqual(2);
  });
  it('POST /interactions/reset resets with param date', async () => {
    // GIVEN
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
    const response = await TestUtil.getServer().post(
      '/interactions/reset?date='.concat(new Date(150).toISOString()),
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.reset_interaction_number).toEqual(1);
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
      categorie: Categorie.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.8,
      type: InteractionType.quizz,
      difficulty: 2,
      categorie: Categorie.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '3',
      score: 0.6,
      type: InteractionType.quizz,
      difficulty: 3,
      categorie: Categorie.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '4',
      score: 0.5,
      type: InteractionType.quizz,
      difficulty: 1,
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '5',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 2,
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '6',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 3,
      categorie: Categorie.climat,
    });
    await TestUtil.create('interaction', {
      id: '7',
      score: 0.7,
      type: InteractionType.quizz,
      difficulty: 3,
      categorie: Categorie.consommation,
    });

    // WHEN
    const response = await TestUtil.getServer().get(
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
      categorie: Categorie.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.2,
      categorie: Categorie.climat,
    });
    // WHEN
    const response = await TestUtil.getServer().post(
      '/interactions/scoring?utilisateurId=utilisateur-id&categorie=climat&boost=4',
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
      categorie: Categorie.alimentation,
    });
    await TestUtil.create('interaction', {
      id: '2',
      score: 0.8,
      categorie: Categorie.climat,
    });
    // WHEN
    const response = await TestUtil.getServer().post(
      '/interactions/scoring?utilisateurId=utilisateur-id&categorie=climat&boost=-2',
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
