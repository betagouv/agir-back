import { TestUtil } from '../../TestUtil';

describe('/api/cms/income (API test)', () => {
  const CMS_DATA = {
    model: 'article',
    event: 'entry.unpublish',
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      thematique_gamification: { id: 1, titre: 'Alimentation' },
      rubriques: ['A', 'B'],
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        url: 'https://',
      },
      difficulty: 3,
      points: 20,
      codePostal: '91120',
    },
  };
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /api/cms/income - create a new article, no user in db, no error', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/cms/income')
      .send(CMS_DATA);

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
    expect(interDefDB[0].duree).toEqual('pas trop long');
    expect(interDefDB[0].frequence).toEqual('souvent');
    expect(interDefDB[0].image_url).toEqual('https://');
    expect(interDefDB[0].difficulty).toEqual(3);
    expect(interDefDB[0].points).toEqual(20);
    expect(interDefDB[0].codes_postaux).toStrictEqual(['91120']); // FIXME
    expect(interDefDB[0].content_id).toEqual('123');
  });
  it('POST /api/cms/income - create a new article, 1 user in db with not article, no error', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/cms/income')
      .send(CMS_DATA);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDB[0].utilisateurId).toEqual('utilisateur-id');
  });
  it('POST /api/cms/income - updates existing article, 1 user in db ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
    });
    await TestUtil.create('interaction', {
      content_id: '123',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/cms/income')
      .send(CMS_DATA);

    // THEN
    const interDB = await TestUtil.prisma.interaction.findMany({});
    const interDefDB = await TestUtil.prisma.interactionDefinition.findMany({});
    expect(response.status).toBe(201);
    expect(interDB).toHaveLength(1);
    expect(interDefDB).toHaveLength(1);
    expect(interDefDB[0].soustitre).toEqual('soustitre 222');
    expect(interDB[0].soustitre).toEqual('soustitre 222');
  });
  it('POST /api/cms/income - updates existing 2 article for 2 users ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: 'u1', email: 'e1' });
    await TestUtil.create('utilisateur', { id: 'u2', email: 'e2' });
    await TestUtil.create('interactionDefinition', {
      content_id: '123',
    });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '123',
      utilisateurId: 'u1',
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '123',
      utilisateurId: 'u2',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/cms/income')
      .send(CMS_DATA);

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
});
