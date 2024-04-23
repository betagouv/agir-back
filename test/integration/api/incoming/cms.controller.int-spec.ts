import { CMSModel } from '../../../../src/infrastructure/api/types/cms/CMSModels';
import { CMSEvent } from '../../../../src/infrastructure/api/types/cms/CMSEvent';
import { DB, TestUtil } from '../../../TestUtil';
import { Besoin } from '../../../../src/domain/aides/besoin';

describe('/api/incoming/cms (API test)', () => {
  const CMS_DATA_DEFI = {
    model: CMSModel.defi,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'sous titre',
      astuces: 'facile',
      pourquoi: 'parce que !!',
      points: 10,
      thematique: { id: 1, titre: 'Alimentation' },
      tags: [
        { id: 1, code: 'capacite_physique' },
        { id: 2, code: 'possede_velo' },
      ],
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
    },
  };
  const CMS_DATA_AIDE = {
    model: CMSModel.aide,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      description: "Contenu de l'aide",
      url_detail_front: '/aide/velo',
      is_simulation: true,
      montantMaximum: '123',
      thematiques: [
        { id: 1, titre: 'Alimentation' },
        { id: 2, titre: 'Climat' },
      ],
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      besoin: {
        id: 7,
        code: 'broyer_vege',
        description: 'Broyer ses végétaux',
      },
    },
  };
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
      partenaire: {
        id: 1,
        nom: 'Angers Loire Métropole',
        lien: 'https://www.angersloiremetropole.fr/',
      },
      source: 'La source',
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://haha' },
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
      partenaire: {
        id: 1,
        nom: 'Angers Loire Métropole',
        lien: 'https://www.angersloiremetropole.fr/',
      },
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
      partenaire: {
        id: 1,
        nom: 'Angers Loire Métropole',
        lien: 'https://www.angersloiremetropole.fr/',
      },
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

  it('POST /api/incoming/cms - create a new article in article table', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const articles = await TestUtil.prisma.article.findMany({});

    expect(response.status).toBe(201);
    expect(articles).toHaveLength(1);
    expect(articles[0].titre).toEqual('titre');
    expect(articles[0].soustitre).toEqual('soustitre 222');
    expect(articles[0].thematique_principale).toEqual('alimentation');
    expect(articles[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(articles[0].duree).toEqual('pas trop long');
    expect(articles[0].frequence).toEqual('souvent');
    expect(articles[0].image_url).toEqual('https://haha');
    expect(articles[0].difficulty).toEqual(3);
    expect(articles[0].points).toEqual(20);
    expect(articles[0].source).toEqual('La source');
    expect(articles[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(articles[0].content_id).toEqual('123');
    expect(articles[0].partenaire).toEqual('Angers Loire Métropole');
    expect(articles[0].rubrique_ids).toEqual(['1', '2']);
    expect(articles[0].rubrique_labels).toEqual(['A', 'B']);
  });

  it('POST /api/incoming/cms - create a new aide in aide table', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_AIDE,
    );

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(1);
    const aide = aides[0];
    expect(aide.titre).toEqual('titre');
    expect(aide.contenu).toEqual("Contenu de l'aide");
    expect(aide.url_simulateur).toEqual('/aide/velo');
    expect(aide.is_simulateur).toEqual(true);
    expect(aide.montant_max).toEqual(123);
    expect(aide.thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(aide.codes_postaux).toStrictEqual(['91120', '75002']);
    expect(aide.content_id).toEqual('123');
    expect(aide.besoin).toEqual(Besoin.broyer_vege);
    expect(aide.besoin_desc).toEqual('Broyer ses végétaux');
  });
  it('POST /api/incoming/cms - create a new defi', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_DEFI,
    );

    // THEN
    const defis = await TestUtil.prisma.defi.findMany({});

    expect(response.status).toBe(201);
    expect(defis).toHaveLength(1);
    const defi = defis[0];
    expect(defi.titre).toEqual('titre');
    expect(defi.sous_titre).toEqual('sous titre');
    expect(defi.content_id).toEqual('123');
    expect(defi.astuces).toEqual('facile');
    expect(defi.pourquoi).toEqual('parce que !!');
    expect(defi.points).toEqual(10);
    expect(defi.thematique).toEqual('alimentation');
    expect(defi.tags).toEqual(['capacite_physique', 'possede_velo']);
  });

  it('POST /api/incoming/cms - updates a  defi', async () => {
    // GIVEN
    TestUtil.create(DB.defi);

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_DEFI,
    );

    // THEN
    const defis = await TestUtil.prisma.defi.findMany({});

    expect(response.status).toBe(201);
    expect(defis).toHaveLength(1);
    const defi = defis[0];
    expect(defi.titre).toEqual('titre');
    expect(defi.sous_titre).toEqual('sous titre');
    expect(defi.content_id).toEqual('123');
    expect(defi.astuces).toEqual('facile');
    expect(defi.pourquoi).toEqual('parce que !!');
    expect(defi.points).toEqual(10);
    expect(defi.thematique).toEqual('alimentation');
    expect(defi.tags).toEqual(['capacite_physique', 'possede_velo']);
  });

  it('POST /api/incoming/cms - updates exisying aide in aide table', async () => {
    // GIVEN
    await TestUtil.create(DB.aide, { content_id: '123' });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_AIDE,
    );

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(1);
    const aide = aides[0];
    expect(aide.titre).toEqual('titre');
    expect(aide.contenu).toEqual("Contenu de l'aide");
    expect(aide.url_simulateur).toEqual('/aide/velo');
    expect(aide.is_simulateur).toEqual(true);
    expect(aide.montant_max).toEqual(123);
    expect(aide.thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(aide.codes_postaux).toStrictEqual(['91120', '75002']);
    expect(aide.content_id).toEqual('123');
    expect(aide.besoin).toEqual(Besoin.broyer_vege);
    expect(aide.besoin_desc).toEqual('Broyer ses végétaux');
  });

  it('POST /api/incoming/cms - removes existing aide when unpublish', async () => {
    // GIVEN
    await TestUtil.create(DB.aide, { content_id: '123' });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_AIDE,
      event: CMSEvent['entry.unpublish'],
    });

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(0);
  });
  it('POST /api/incoming/cms - removes existing aide when delete', async () => {
    // GIVEN
    await TestUtil.create(DB.aide, { content_id: '123' });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_AIDE,
      event: CMSEvent['entry.delete'],
    });

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(0);
  });

  it('POST /api/incoming/cms - create a new quizz in quizz table', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_QUIZZ,
    );

    // THEN
    const quizzes = await TestUtil.prisma.quizz.findMany({});

    expect(response.status).toBe(201);
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].titre).toEqual('titre');
    expect(quizzes[0].soustitre).toEqual('soustitre 222');
    expect(quizzes[0].thematique_principale).toEqual('alimentation');
    expect(quizzes[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(quizzes[0].duree).toEqual('pas trop long');
    expect(quizzes[0].frequence).toEqual('souvent');
    expect(quizzes[0].image_url).toEqual('https://');
    expect(quizzes[0].difficulty).toEqual(3);
    expect(quizzes[0].points).toEqual(20);
    expect(quizzes[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(quizzes[0].content_id).toEqual('123');
    expect(quizzes[0].partenaire).toEqual('Angers Loire Métropole');
    expect(quizzes[0].rubrique_ids).toEqual(['1', '2']);
    expect(quizzes[0].rubrique_labels).toEqual(['A', 'B']);
  });
  it('POST /api/incoming/cms - updates existing article in article table', async () => {
    // GIVEN
    await TestUtil.create(DB.article, { content_id: '123' });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const articles = await TestUtil.prisma.article.findMany({});

    expect(response.status).toBe(201);
    expect(articles).toHaveLength(1);
    expect(articles[0].titre).toEqual('titre');
    expect(articles[0].soustitre).toEqual('soustitre 222');
    expect(articles[0].thematique_principale).toEqual('alimentation');
    expect(articles[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(articles[0].duree).toEqual('pas trop long');
    expect(articles[0].frequence).toEqual('souvent');
    expect(articles[0].image_url).toEqual('https://haha');
    expect(articles[0].difficulty).toEqual(3);
    expect(articles[0].points).toEqual(20);
    expect(articles[0].source).toEqual('La source');
    expect(articles[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(articles[0].content_id).toEqual('123');
    expect(articles[0].partenaire).toEqual('Angers Loire Métropole');
    expect(articles[0].rubrique_ids).toEqual(['1', '2']);
    expect(articles[0].rubrique_labels).toEqual(['A', 'B']);
  });
  it('POST /api/incoming/cms - updates existing quizz in quizz table', async () => {
    // GIVEN
    await TestUtil.create_quizz({ content_id: '123' });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_QUIZZ,
    );

    // THEN
    const quizzes = await TestUtil.prisma.quizz.findMany({});

    expect(response.status).toBe(201);
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].titre).toEqual('titre');
    expect(quizzes[0].soustitre).toEqual('soustitre 222');
    expect(quizzes[0].thematique_principale).toEqual('alimentation');
    expect(quizzes[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(quizzes[0].duree).toEqual('pas trop long');
    expect(quizzes[0].frequence).toEqual('souvent');
    expect(quizzes[0].image_url).toEqual('https://');
    expect(quizzes[0].difficulty).toEqual(3);
    expect(quizzes[0].points).toEqual(20);
    expect(quizzes[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(quizzes[0].content_id).toEqual('123');
    expect(quizzes[0].partenaire).toEqual('Angers Loire Métropole');
    expect(quizzes[0].rubrique_ids).toEqual(['1', '2']);
    expect(quizzes[0].rubrique_labels).toEqual(['A', 'B']);
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
    const quizzDB = await TestUtil.prisma.quizz.findMany({});
    const articleDB = await TestUtil.prisma.article.findMany({});

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(response3.status).toBe(201);
    expect(quizzDB).toHaveLength(0);
    expect(articleDB).toHaveLength(1);
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
  it('POST /api/incoming/cms - updates existing article, 1 user in db ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '123',
      soustitre: 'hahah',
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );
    // THEN
    const articleDB = await TestUtil.prisma.article.findMany({});
    expect(response.status).toBe(201);
    expect(articleDB).toHaveLength(1);
    expect(articleDB[0].soustitre).toEqual('soustitre 222');
  });

  it('POST /api/incoming/cms - does nothing when no publishedAt value', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const data = { ...CMS_DATA_ARTICLE };
    data.entry = { ...data.entry };
    data.entry.publishedAt = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const articleDB = await TestUtil.prisma.article.findMany({});
    expect(response.status).toBe(201);
    expect(articleDB).toHaveLength(0);
  });
  it('POST /api/incoming/cms - optional points lead to 0 points', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const data = { ...CMS_DATA_ARTICLE };
    data.entry = { ...data.entry };
    data.entry.points = null;
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(data);

    // THEN
    const articleDB = await TestUtil.prisma.article.findMany({});
    expect(response.status).toBe(201);
    expect(articleDB).toHaveLength(1);
    expect(articleDB[0].points).toEqual(0);
  });
});
