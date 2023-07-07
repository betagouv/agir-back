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
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    await TestUtil.prisma.interaction.create({
      data: {
        id: '1',
        content_id: '123',
        type: 'quizz',
        titre: 'the quizz !',
        categorie: 'apprendre',
        tags: ['a', 'b', 'c'],
        difficulty: 1,
        points: 5,
        reco_score: 100,
        utilisateurId: '2',
      },
    });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/2/interactions',
    );
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: '1' },
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      id: '1',
      content_id: '123',
      type: 'quizz',
      titre: 'the quizz !',
      soustitre: null,
      categorie: 'apprendre',
      tags: ['a', 'b', 'c'],
      clicked: false,
      clicked_at: null,
      done: false,
      done_at: null,
      duree: null,
      frequence: null,
      image_url: null,
      url: null,
      seen: 0,
      seen_at: null,
      succeeded: false,
      succeeded_at: null,
      difficulty: 1,
      points: 5,
      reco_score: 100,
      utilisateurId: '2',
      created_at: dbInteraction.created_at.toISOString(),
      updated_at: dbInteraction.updated_at.toISOString(),
    });
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
