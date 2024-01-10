import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/thematique';

describe('/utilisateurs/id/interactions (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterEach(() => {});

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
  it.skip('GET /utilisateurs/id/interactions - pinned interaction at proper position', async () => {
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
  it.skip('GET /utilisateurs/id/interactions - list quizz with target utilisateur difficultys', async () => {
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
});
