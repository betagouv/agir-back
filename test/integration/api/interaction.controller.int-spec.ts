import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';

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
  it('GET /utilisateurs/id/interactions - list all interactions in v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      code_postal: null,
      history: {},
    });
    await TestUtil.create('article', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('article', {
      content_id: '2',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '1',
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      difficulty: DifficultyLevel.L1,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/interactions',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
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
});
