import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/interactions (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
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
});
