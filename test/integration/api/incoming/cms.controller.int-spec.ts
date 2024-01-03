import { CMSModel } from '../../../../src/infrastructure/api/types/cms/CMSModels';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { CMSEvent } from '../../../../src/infrastructure/api/types/cms/CMSEvent';
import { TestUtil } from '../../../TestUtil';

describe('/api/incoming/cms (API test)', () => {
  const CMS_DATA_ARTICLE = {
    model: CMSModel.article,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      thematique_gamification: { id: 1, titre: 'Alimentation' },
      thematiques: [
        { id: 1, titre: 'Alimentation' },
        { id: 2, titre: 'Climat' },
      ],
      rubriques: [
        { id: 1, titre: 'A' },
        { id: 2, titre: 'B' },
      ],
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://' },
        },
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
    },
  };
  const CMS_DATA_ARTICLE_NOEL = {
    model: CMSModel.article,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      thematique_gamification: { id: 1, titre: 'Alimentation' },
      thematiques: [
        { id: 1, titre: 'Alimentation' },
        { id: 2, titre: 'Climat' },
      ],
      rubriques: [
        { id: 1, titre: 'A' },
        { id: 2, titre: 'Ceci est Noël' },
      ],
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://' },
        },
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
    },
  };
  const CMS_DATA_QUIZZ = {
    model: CMSModel.quizz,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      thematique_gamification: { id: 1, titre: 'Alimentation' },
      thematiques: [
        { id: 1, titre: 'Alimentation' },
        { id: 2, titre: 'Climat' },
      ],
      rubriques: [
        { id: 1, titre: 'A' },
        { id: 2, titre: 'B' },
      ],
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://' },
        },
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
    },
  };
  const CMS_DATA_QUIZZ_UNPUBLISH = {
    model: CMSModel.quizz,
    event: CMSEvent['entry.unpublish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      thematique_gamification: { id: 1, titre: 'Alimentation' },
      thematiques: [
        { id: 1, titre: 'Alimentation' },
        { id: 2, titre: 'Climat' },
      ],
      rubriques: [
        { id: 1, titre: 'A' },
        { id: 2, titre: 'B' },
      ],
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://' },
        },
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
    },
  };
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    TestUtil.token = process.env.CMS_WEBHOOK_API_KEY;
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /api/incoming/cms - 401 si header manquant', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/cms')
      .send(CMS_DATA_ARTICLE);

    // THEN
    expect(response.status).toBe(401);
  });
  it('POST /api/incoming/cms - 403 si mauvaise clé API', async () => {
    // GIVEN
    TestUtil.token = 'bad';
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    expect(response.status).toBe(403);
  });
  it('POST /api/incoming/cms - create a new article, no user in db, no error', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    const interDBCount = await TestUtil.prisma.interaction.count();

    expect(response.status).toBe(201);
    expect(interDBCount).toEqual(0);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].type).toEqual('article');
    expect(interDefDB[0].titre).toEqual('titre');
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDefDB[0].thematique_gamification).toEqual('alimentation');
    expect(interDefDB[0].thematique_gamification_titre).toEqual('Alimentation');
    expect(interDefDB[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(interDefDB[0].duree).toEqual('pas trop long');
    expect(interDefDB[0].frequence).toEqual('souvent');
    expect(interDefDB[0].image_url).toEqual('https://');
    expect(interDefDB[0].difficulty).toEqual(3);
    expect(interDefDB[0].points).toEqual(20);
    expect(interDefDB[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(interDefDB[0].content_id).toEqual('123');
    expect(interDefDB[0].score.toNumber()).toEqual(0.5);
  });
  it('POST /api/incoming/cms - create a new article with score 0.7 if rubriques contains Noel', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE_NOEL,
    );

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});

    expect(response.status).toBe(201);
    expect(interDefDB[0].score.toNumber()).toEqual(0.7);
  });
  it('POST /api/incoming/cms - creates a new article then a new quizz of same id, unpublish quizz leaves article', async () => {
    // GIVEN

    // WHEN
    const response1 = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );
    const response2 = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_QUIZZ,
    );
    const response3 = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_QUIZZ_UNPUBLISH,
    );

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(response3.status).toBe(201);
    expect(interDefDB).toHaveLength(1);
  });
  it('POST /api/incoming/cms - creates a new article then a new quizz with same id, 2 contents in the end', async () => {
    // GIVEN

    // WHEN
    const response1 = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );
    const response2 = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_QUIZZ,
    );

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(interDefDB).toHaveLength(2);
  });
  it('POST /api/incoming/cms - create a new article, 1 user in db with not article, no error', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].utilisateurId).toEqual('utilisateur-id');
  });
  it('POST /api/incoming/cms - create 1 thematique', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: CMSModel.thematique,
      event: CMSEvent['entry.publish'],
      entry: { id: 1, titre: 'yo' },
    });

    // THEN
    expect(response.status).toBe(201);
    const thematiqueDB = await TestUtil.prisma.thematique.findMany({});
    expect(thematiqueDB).toHaveLength(1);
    expect(thematiqueDB[0].id_cms).toEqual(1);
    expect(thematiqueDB[0].titre).toEqual('yo');
  });
  it('POST /api/incoming/cms - does nothing when model = aide', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: 'aide',
    });

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - updates existing article, 1 user in db ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      content_id: '123',
      type: InteractionType.article,
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );
    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].soustitre).toEqual('soustitre 222');
  });
  it('POST /api/incoming/cms - updates existing article, sets 0.7 if contains Noel ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      content_id: '123',
      type: InteractionType.article,
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE_NOEL,
    );
    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDefDB[0].score.toNumber()).toEqual(0.7);
    expect(interDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].score.toNumber()).toEqual(0.7);
  });
  it('POST /api/incoming/cms - updates existing 2 article for 2 users ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'u1', email: 'e1' });
    await TestUtil.create('utilisateur', { id: 'u2', email: 'e2' });
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u1',
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u2',
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(2);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[1].soustitre).toEqual('soustitre 222');
  });
  it('POST /api/incoming/cms - does nothing when no publishedAt value', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const data = { ...CMS_DATA_ARTICLE };
    data.entry = { ...data.entry };
    data.entry.publishedAt = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - optional points lead to 0 points', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const data = { ...CMS_DATA_ARTICLE };
    data.entry = { ...data.entry };
    data.entry.points = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].points).toEqual(0);
  });
  it('POST /api/incoming/cms - unpublish event removes interaction definition', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
      type: InteractionType.article,
    });

    const data = { ...CMS_DATA_ARTICLE };
    data.event = CMSEvent['entry.unpublish'];
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDefDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - unpublish event removes interaction when not done, does not remove other type of content', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'u1', email: 'e1' });
    await TestUtil.create('utilisateur', { id: 'u2', email: 'e2' });
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
    });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u1',
      done: true,
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '123',
      type: InteractionType.article,
      utilisateurId: 'u2',
      done: false,
    });
    await TestUtil.create('interaction', {
      id: 'i3',
      content_id: '123',
      type: InteractionType.quizz,
      utilisateurId: 'u2',
      done: false,
    });

    const data = { ...CMS_DATA_ARTICLE };
    data.event = CMSEvent['entry.delete'];
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const interDB_1 = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'i1' },
    });
    const interDB_2 = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'i2' },
    });
    const interDB_3 = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'i3' },
    });
    expect(response.status).toBe(201);
    expect(interDB_1).not.toBeNull();
    expect(interDB_2).toBeNull();
    expect(interDB_3).not.toBeNull();
  });
});
