import { CMSModel } from '../../../../src/infrastructure/api/types/cms/CMSModels';
import { CMSEvent } from '../../../../src/infrastructure/api/types/cms/CMSEvent';
import { DB, TestUtil } from '../../../TestUtil';
import { Besoin } from '../../../../src/domain/aides/besoin';
import { Univers } from '../../../../src/domain/univers/univers';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';
import {
  CategorieQuestionKYC,
  KYCID,
  TypeReponseQuestionKYC,
} from '../../../../src/domain/kyc/questionQYC';
import { KYC, Mission } from '.prisma/client';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { Tag } from '../../../../src/domain/scoring/tag';
import { ContentType } from '../../../../src/domain/contenu/contentType';

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
      univers: [
        {
          id: 1,
          code: Univers.climat,
        },
      ],
      thematique_univers: [
        {
          id: 1,
          code: ThematiqueUnivers.dechets_compost,
        },
      ],
    },
  };
  const CMS_DATA_KYC = {
    model: CMSModel.kyc,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      question: 'question',
      code: KYCID.KYC001,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: CategorieQuestionKYC.mission,
      points: 5,
      is_ngc: false,
      reponses: [
        {
          id: 1,
          reponse: 'haha',
          code: 'haha_code',
        },
        {
          id: 2,
          reponse: 'hihi',
          code: 'hihi_code',
        },
      ],
      thematique: { id: 1 },
      tags: [
        { id: 1, code: 'capacite_physique' },
        { id: 2, code: 'possede_velo' },
      ],
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      univers: [
        {
          id: 1,
          code: Univers.climat,
        },
      ],
    },
  };
  const CMS_DATA_MISSION = {
    model: CMSModel.mission,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      est_visible: true,
      thematique_univers_unique: {
        id: 1,
        code: ThematiqueUnivers.cereales,
      },
      prochaines_thematiques: [
        {
          id: 1,
          code: ThematiqueUnivers.dechets_compost,
        },
      ],
      objectifs: [
        { id: 1, titre: 'do it article', points: 5, article: { id: 11 } },
        { id: 2, titre: 'do it defi', points: 10, defi: { id: 12 } },
        { id: 3, titre: 'do it kyc', points: 15, kyc: { code: KYCID.KYC001 } },
        { id: 4, titre: 'do it quizz', points: 20, quizz: { id: 13 } },
      ],
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
      include_codes_commune: '01,02',
      exclude_codes_commune: '03,04',
      codes_departement: '78',
      codes_region: '25',
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

    expect(aide.include_codes_commune).toEqual(['01', '02']);
    expect(aide.exclude_codes_commune).toEqual(['03', '04']);
    expect(aide.codes_departement).toEqual(['78']);
    expect(aide.codes_region).toEqual(['25']);
  });
  it('POST /api/incoming/cms - create a new kyc', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_KYC,
    );

    // THEN
    const kycs = await TestUtil.prisma.kYC.findMany({});

    expect(response.status).toBe(201);
    expect(kycs).toHaveLength(1);

    const item: KYC = kycs[0];

    expect(item.code).toEqual('KYC001');
    expect(item.question).toEqual('question');
    expect(item.id_cms).toEqual(123);
    expect(item.type).toEqual(TypeReponseQuestionKYC.choix_multiple);
    expect(item.categorie).toEqual(CategorieQuestionKYC.mission);
    expect(item.points).toEqual(5);
    expect(item.is_ngc).toEqual(false);
    expect(item.reponses).toEqual([
      {
        label: 'haha',
        code: 'haha_code',
      },
      {
        label: 'hihi',
        code: 'hihi_code',
      },
    ]);
    expect(item.thematique).toEqual(Thematique.alimentation);
    expect(item.tags).toEqual([Tag.capacite_physique, Tag.possede_velo]);
    expect(item.universes).toEqual([Univers.climat]);
  });
  it('POST /api/incoming/cms - create a new mission', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_MISSION,
    );

    // THEN
    const missions = await TestUtil.prisma.mission.findMany({});

    expect(response.status).toBe(201);
    expect(missions).toHaveLength(1);

    const item: Mission = missions[0];

    expect(item.est_visible).toEqual(true);
    expect(item.id_cms).toEqual(123);
    expect(item.prochaines_thematiques).toEqual([
      ThematiqueUnivers.dechets_compost,
    ]);
    expect(item.thematique_univers).toEqual(ThematiqueUnivers.cereales);
    expect(item.objectifs).toEqual([
      {
        titre: 'do it article',
        content_id: '11',
        type: ContentType.article,
        points: 5,
      },
      {
        titre: 'do it defi',
        content_id: '12',
        type: ContentType.defi,
        points: 10,
      },
      {
        titre: 'do it kyc',
        content_id: KYCID.KYC001,
        type: ContentType.kyc,
        points: 15,
      },
      {
        titre: 'do it quizz',
        content_id: '13',
        type: ContentType.quizz,
        points: 20,
      },
    ]);
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
    expect(defi.universes).toEqual([Univers.climat]);
    expect(defi.thematiquesUnivers).toEqual([
      ThematiqueUnivers.dechets_compost,
    ]);
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
    expect(defi.universes).toEqual([Univers.climat]);
    expect(defi.thematiquesUnivers).toEqual([
      ThematiqueUnivers.dechets_compost,
    ]);
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
    expect(aide.include_codes_commune).toEqual(['01', '02']);
    expect(aide.exclude_codes_commune).toEqual(['03', '04']);
    expect(aide.codes_departement).toEqual(['78']);
    expect(aide.codes_region).toEqual(['25']);
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
    await TestUtil.create(DB.quizz, { content_id: '123' });

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
  it('POST /api/incoming/cms - create 1 univers', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: CMSModel.univers,
      event: CMSEvent['entry.publish'],
      entry: {
        id: 1,
        label: 'yo',
        code: Univers.climat,
        imageUrl: {
          formats: {
            thumbnail: { url: 'https://haha' },
          },
        },
      },
    });

    // THEN
    expect(response.status).toBe(201);
    const universDB = await TestUtil.prisma.univers.findMany({});
    expect(universDB).toHaveLength(1);
    expect(universDB[0].id_cms).toEqual(1);
    expect(universDB[0].label).toEqual('yo');
    expect(universDB[0].code).toEqual(Univers.climat);
    expect(universDB[0].image_url).toEqual('https://haha');
  });
  it('POST /api/incoming/cms - create 1 univers', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: CMSModel.univers,
      event: CMSEvent['entry.publish'],
      entry: {
        id: 1,
        label: 'yo',
        code: Univers.climat,
        imageUrl: {
          formats: {
            thumbnail: { url: 'https://haha' },
          },
        },
      },
    });

    // THEN
    expect(response.status).toBe(201);
    const universDB = await TestUtil.prisma.univers.findMany({});
    expect(universDB).toHaveLength(1);
    expect(universDB[0].id_cms).toEqual(1);
    expect(universDB[0].label).toEqual('yo');
    expect(universDB[0].code).toEqual(Univers.climat);
    expect(universDB[0].image_url).toEqual('https://haha');
  });
  it('POST /api/incoming/cms - create 1 thematiqueUnivers', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: CMSModel['thematique-univers'],
      event: CMSEvent['entry.publish'],
      entry: {
        id: 1,
        label: 'yo',
        code: ThematiqueUnivers.cereales,
        univers_parent: { id: 1, code: 'climat' },
        imageUrl: {
          formats: {
            thumbnail: { url: 'https://haha' },
          },
        },
      },
    });

    // THEN
    expect(response.status).toBe(201);
    const universDB = await TestUtil.prisma.thematiqueUnivers.findMany({});
    expect(universDB).toHaveLength(1);
    expect(universDB[0].id_cms).toEqual(1);
    expect(universDB[0].label).toEqual('yo');
    expect(universDB[0].code).toEqual(ThematiqueUnivers.cereales);
    expect(universDB[0].image_url).toEqual('https://haha');
    expect(universDB[0].univers_parent).toEqual(Univers.climat);
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
