import { KYC, Prisma } from '.prisma/client';
import { CMSWebhookEntryAPI } from 'src/infrastructure/api/types/cms/CMSWebhookEntryAPI';
import { TypeAction } from '../../../../src/domain/actions/typeAction';
import { Echelle } from '../../../../src/domain/aides/echelle';
import {
  CategorieRecherche,
  SousCategorieRecherche,
} from '../../../../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCID } from '../../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../../src/domain/kyc/questionKYC';
import { Tag } from '../../../../src/domain/scoring/tag';
import { SousThematique } from '../../../../src/domain/thematique/sousThematique';
import { Thematique } from '../../../../src/domain/thematique/thematique';
import { CMSEvent } from '../../../../src/infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../../../../src/infrastructure/api/types/cms/CMSModels';
import { CMSWebhookAPI } from '../../../../src/infrastructure/api/types/cms/CMSWebhookAPI';
import { ArticleRepository } from '../../../../src/infrastructure/repository/article.repository';
import { KycRepository } from '../../../../src/infrastructure/repository/kyc.repository';
import { PartenaireRepository } from '../../../../src/infrastructure/repository/partenaire.repository';
import { DB, TestUtil } from '../../../TestUtil';

describe('/api/incoming/cms (API test)', () => {
  const DELETE_SIMU = {
    event: 'entry.unpublish',
    createdAt: '2025-03-31T09:31:00.185Z',
    model: 'action-simulateur',
    entry: {
      id: 1,
      titre: 'The simulateur !!',
      sous_titre: 'De test ce simulateur ha',
      code: 'simu_action_test',
      createdAt: '2025-02-14T14:31:44.913Z',
      updatedAt: '2025-03-31T09:31:00.115Z',
      publishedAt: null,
      pourquoi: null,
      kycs: [
        {
          id: 168,
          question: "Allez-vous à l'hôtel ?",
          code: 'KYC_consommation_logement_vacances_hotel',
          type: 'choix_unique',
          categorie: 'recommandation',
          points: 5,
          is_ngc: true,
          createdAt: '2024-10-12T16:35:30.239Z',
          updatedAt: '2024-10-21T15:33:27.992Z',
          publishedAt: '2024-10-12T16:35:31.061Z',
          ngc_key: 'logement . vacances . hotel . présent',
          short_question: 'Hôtel',
          unite: null,
          emoji: '🏨',
          A_SUPPRIMER: null,
        },
        {
          id: 26,
          question: 'À quelle fréquence consommez-vous des produits locaux ?',
          code: 'KYC_local_frequence',
          type: 'choix_unique',
          categorie: 'mission',
          points: 5,
          is_ngc: true,
          createdAt: '2024-06-09T18:05:13.672Z',
          updatedAt: '2025-03-12T10:56:05.217Z',
          publishedAt: '2024-06-09T18:05:19.621Z',
          ngc_key: 'alimentation . local . consommation',
          short_question: null,
          unite: null,
          emoji: null,
          A_SUPPRIMER: null,
        },
        {
          id: 60,
          question: 'Avez-vous un jardin ou un espace vert à disposition ?',
          code: 'KYC_jardin',
          type: 'choix_unique',
          categorie: 'mission',
          points: 5,
          is_ngc: false,
          createdAt: '2024-08-08T13:30:51.489Z',
          updatedAt: '2024-10-14T13:23:50.935Z',
          publishedAt: '2024-08-08T13:55:33.617Z',
          ngc_key: 'logement . extérieur',
          short_question: null,
          unite: null,
          emoji: null,
          A_SUPPRIMER: null,
        },
      ],
      thematique: {
        id: 2,
        titre: '☀️ Environnement',
        createdAt: '2023-09-20T12:17:09.385Z',
        updatedAt: '2024-11-04T22:34:59.727Z',
        publishedAt: '2023-12-05T20:38:49.216Z',
        code: 'climat',
        label: 'La planète',
        emoji: '☀️',
      },
      besoins: [],
    },
  };

  const CMS_DATA_ACTION: CMSWebhookAPI = {
    model: CMSModel.action,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      external_id: 'ext_123',
      partenaire: {
        id: 1,
      },
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      titre: 'titre',
      emoji: '🔥',
      sous_titre: 'sous-titre',
      consigne: 'Faites rapidement',
      label_compteur: 'tout le monde a déjà fait !',
      pourquoi: 'pourquoi',
      felicitations: 'Bravo !!',
      comment: 'comment',
      objet_lvo: 'phone',
      action_lvo: 'donner',
      type_action: 'quizz',
      categorie_recettes: 'vegan',
      sous_categorie_recettes: SousCategorieRecherche.sans_saumon,
      categorie_pdcn: CategorieRecherche.circuit_court,
      sources: [{ libelle: 'haha', lien: 'hoho' }],
      VISIBLE_PROD: true,
      quizzes: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
      articles: [
        {
          id: 9,
        },
        {
          id: 10,
        },
      ],
      faqs: [
        {
          id: 5,
        },
        {
          id: 6,
        },
      ],
      kycs: [
        {
          id: 7,
          code: 'KYC01',
        },
        {
          id: 8,
          code: 'KYC02',
        },
      ],

      besoins: [
        {
          id: 10,
          code: 'composter',
          description: '',
        },
        {
          id: 11,
          code: 'mieux_manger',
          description: '',
        },
      ],
      tag_v2_excluants: [
        {
          id: 1,
          code: 'AA',
        },
        {
          id: 2,
          code: 'BB',
        },
      ],
      tag_v2_incluants: [
        {
          id: 1,
          code: 'CC',
        },
        {
          id: 2,
          code: 'DD',
        },
      ],
      code: 'code',
      thematique: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
      sous_thematique: {
        id: 1,
        code: SousThematique.logement_economie_energie,
      },
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_ACTION_BILAN: CMSWebhookAPI = {
    model: CMSModel['action-bilan'],
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      titre: 'titre',
      sous_titre: 'sous-titre',
      kycs: [
        {
          id: 3,
          code: 'KYC03',
        },
        {
          id: 4,
          code: 'KYC04',
        },
      ],
      code: 'code',
      thematique: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
      sous_thematique: {
        id: 1,
        code: SousThematique.logement_economie_energie,
      },
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_KYC: CMSWebhookAPI = {
    model: CMSModel.kyc,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      question: 'question',
      short_question: 'short question',
      code: KYCID.KYC001,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.mission,
      points: 5,
      emoji: '🔥',
      unite: 'kg (kilogramme)',
      is_ngc: false,
      A_SUPPRIMER: true,
      ngc_key: 'a . b . c',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://' },
        },
        url: 'http://monurl',
      },
      reponses: [
        {
          id: 1,
          reponse: 'haha',
          code: 'haha_code',
          ngc_code: '123',
        },
        {
          id: 2,
          reponse: 'hihi',
          code: 'hihi_code',
          ngc_code: '456',
        },
      ],
      thematique: {
        id: 1,
        code: Thematique.alimentation,
        titre: 'Thematique alimentation',
      },
      tags: [
        { id: 1, code: 'capacite_physique' },
        { id: 2, code: 'possede_velo' },
      ],
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      OR_Conditions: [
        {
          AND_Conditions: [
            {
              code_reponse: 'yop',
              kyc: {
                code: 'KYC06',
                id: 8888,
                ngc_code: '',
                reponse: '',
              },
            },
          ],
        },
      ],
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_AIDE: CMSWebhookAPI = {
    model: CMSModel.aide,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      description: "Contenu de l'aide",
      url_detail_front: '/aide/velo',
      url_source: 'haha',
      url_demande: 'hihi',
      is_simulation: true,
      montantMaximum: '123',
      thematiques: [
        { id: 1, titre: 'Alimentation', code: Thematique.alimentation },
        { id: 2, titre: 'Climat', code: Thematique.climat },
      ],
      partenaires: [
        {
          id: 1,
        },
      ],
      date_expiration: new Date(123),
      derniere_maj: new Date(123),
      codes_postaux: '91120 , 75002',
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
      est_gratuit: true,
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_ARTICLE: CMSWebhookAPI = {
    model: CMSModel.article,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      sousTitre: 'soustitre 222',
      derniere_maj: new Date(123),
      contenu: 'Un long article très intéressant',
      VISIBLE_PROD: true,
      thematique_gamification: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
      tag_article: { code: 'composter' },
      thematiques: [
        { id: 1, titre: 'Alimentation', code: Thematique.alimentation },
        { id: 2, titre: 'Climat', code: Thematique.climat },
      ],
      rubriques: [
        { id: 1, titre: 'A' },
        { id: 2, titre: 'B' },
      ],
      partenaire: {
        id: 1,
      },
      source: 'La source',
      duree: 'pas trop long',
      frequence: 'souvent',
      imageUrl: {
        formats: {
          thumbnail: { url: 'https://haha' },
        },
        url: '',
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      mois: '0,1',
      include_codes_commune: '01,02',
      exclude_codes_commune: '03,04',
      codes_departement: '78',
      codes_region: '25',
      sources: [{ libelle: 'haha', lien: 'hoho' }],
      tag_v2_excluants: [
        {
          id: 1,
          code: 'AA',
        },
        {
          id: 2,
          code: 'BB',
        },
      ],
      tag_v2_incluants: [
        {
          id: 1,
          code: 'CC',
        },
        {
          id: 2,
          code: 'DD',
        },
      ],
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_PARTENAIRE: CMSWebhookAPI = {
    model: CMSModel.partenaire,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      nom: 'part',
      lien: 'the lien',
      code_commune: '456',
      code_departement: '789',
      code_region: '111',
      code_epci: '242100410',
      echelle: Echelle.Département,
      logo: [
        {
          formats: {
            thumbnail: { url: 'https://haha' },
          },
          url: '',
        },
      ],
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_FAQ: CMSWebhookAPI = {
    model: CMSModel.faq,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      question: 'The question',
      reponse: 'The reponse',
      thematique: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_BLOCKTEXT: CMSWebhookAPI = {
    model: CMSModel.text,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      code: '456',
      titre: 'The titre',
      texte: 'The texte',
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_TAG: CMSWebhookAPI = {
    model: CMSModel['tag-v2'],
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      code: '456',
      description: 'The desc',
      label_explication: 'expli',
      boost_absolu: 20,
      ponderation: 3,
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_SELECTION: CMSWebhookAPI = {
    model: CMSModel['selection'],
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      code: '456',
      description: 'The desc',
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_QUIZZ: CMSWebhookAPI = {
    model: CMSModel.quizz,
    event: CMSEvent['entry.publish'],
    entry: {
      id: 123,
      titre: 'titre',
      articles: [{ id: 1 }],
      questions: [
        {
          libelle: 'super question',
          explicationOk: 'OK',
          explicationKO: 'KO',
          reponses: [
            {
              reponse: 'a',
              exact: true,
              id: 4,
            },
            {
              reponse: 'b',
              exact: false,
              id: 5,
            },
          ],
          id: 2,
        },
        {
          id: 6,
          libelle: '2nd question',
          explicationOk: 'OK_2',
          explicationKO: 'KO_2',
          reponses: [
            {
              reponse: 'c',
              exact: false,
              id: 7,
            },
            {
              reponse: 'd',
              exact: true,
              id: 8,
            },
          ],
        },
      ],
      sousTitre: 'soustitre 222',
      thematique_gamification: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
      thematiques: [
        { id: 1, titre: 'Alimentation', code: Thematique.alimentation },
        { id: 2, titre: 'Climat', code: Thematique.climat },
      ],
      partenaire: {
        id: 1,
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
        url: '',
      },
      difficulty: 3,
      points: 20,
      codes_postaux: '91120,75002',
      publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      mois: '0,1',
    } as CMSWebhookEntryAPI,
  };

  const CMS_DATA_QUIZZ_UNPUBLISH: CMSWebhookAPI = {
    model: CMSModel.quizz,
    event: CMSEvent['entry.unpublish'],
    entry: {
      id: 123,
      titre: 'titre',
      sous_titre: 'soustitre 222',
      thematique_gamification: {
        id: 1,
        titre: 'Alimentation',
        code: Thematique.alimentation,
      },
      thematiques: [
        { id: 1, titre: 'Alimentation', code: Thematique.alimentation },
        { id: 2, titre: 'Climat', code: Thematique.climat },
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
      mois: '0,1',
    } as unknown as CMSWebhookEntryAPI,
  };

  const kycRepository = new KycRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);

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

  it('POST /api/incoming/cms - create a conformite', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      model: CMSModel.conformite,
      event: CMSEvent['entry.publish'],
      entry: {
        id: 1,
        Titre: 'TheTitre',
        contenu: 'Super Contenu',
        code: 'TheCode',
      },
    });

    // THEN
    const confomrite = await TestUtil.prisma.conformite.findMany({});

    expect(response.status).toBe(201);
    expect(confomrite).toHaveLength(1);
    expect(confomrite[0].titre).toEqual('TheTitre');
    expect(confomrite[0].id_cms).toEqual('1');
    expect(confomrite[0].contenu).toEqual('Super Contenu');
    expect(confomrite[0].code).toEqual('TheCode');
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
    expect(articles[0].derniere_maj).toEqual(new Date(123));
    expect(articles[0].soustitre).toEqual('soustitre 222');
    expect(articles[0].thematique_principale).toEqual('alimentation');
    expect(articles[0].tags_a_exclure_v2).toEqual(['AA', 'BB']);
    expect(articles[0].tags_a_inclure_v2).toEqual(['CC', 'DD']);
    expect(articles[0].thematiques).toStrictEqual(['alimentation', 'climat']);
    expect(articles[0].duree).toEqual('pas trop long');
    expect(articles[0].frequence).toEqual('souvent');
    expect(articles[0].image_url).toEqual('https://haha');
    expect(articles[0].contenu).toEqual('Un long article très intéressant');
    expect(articles[0].difficulty).toEqual(3);
    expect(articles[0].points).toEqual(20);
    expect(articles[0].source).toEqual('La source');
    expect(articles[0].codes_postaux).toStrictEqual(['91120', '75002']);
    expect(articles[0].mois).toStrictEqual([0, 1]);
    expect(articles[0].content_id).toEqual('123');
    expect(articles[0].partenaire_id).toEqual('1');
    expect(articles[0].rubrique_ids).toEqual(['1', '2']);
    expect(articles[0].rubrique_labels).toEqual(['A', 'B']);
    expect(articles[0].include_codes_commune).toEqual(['01', '02']);
    expect(articles[0].exclude_codes_commune).toEqual(['03', '04']);
    expect(articles[0].codes_departement).toEqual(['78']);
    expect(articles[0].codes_region).toEqual(['25']);
    expect(articles[0].sources).toEqual([{ label: 'haha', url: 'hoho' }]);
    expect(articles[0].VISIBLE_PROD).toEqual(true);
  });

  it('POST /api/incoming/cms - create a new partenaire in partenaire table', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_PARTENAIRE,
    );

    // THEN
    const partenaire = await TestUtil.prisma.partenaire.findMany({});

    expect(response.status).toBe(201);
    expect(partenaire).toHaveLength(1);
    expect(partenaire[0].content_id).toEqual('123');
    expect(partenaire[0].nom).toEqual('part');
    expect(partenaire[0].code_commune).toEqual('456');
    expect(partenaire[0].code_departement).toEqual('789');
    expect(partenaire[0].code_region).toEqual('111');
    expect(partenaire[0].code_epci).toEqual('242100410');
    expect(partenaire[0].url).toEqual('the lien');
    expect(partenaire[0].echelle).toEqual(Echelle.Département);
    expect(partenaire[0].image_url).toEqual('https://haha');
    expect(partenaire[0].liste_communes_calculees).toEqual([
      '21231',
      '21166',
      '21617',
      '21171',
      '21515',
      '21278',
      '21355',
      '21540',
      '21390',
      '21452',
      '21485',
      '21481',
      '21605',
      '21263',
      '21003',
      '21223',
      '21473',
      '21315',
      '21105',
      '21106',
      '21370',
      '21192',
      '21270',
    ]);
  });

  it('POST /api/incoming/cms - create a new FAQ', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_FAQ,
    );

    // THEN
    const faq = await TestUtil.prisma.fAQ.findMany({});

    expect(response.status).toBe(201);
    expect(faq).toHaveLength(1);
    expect(faq[0].id_cms).toEqual('123');
    expect(faq[0].question).toEqual('The question');
    expect(faq[0].reponse).toEqual('The reponse');
    expect(faq[0].thematique).toEqual(Thematique.alimentation);
  });

  it('POST /api/incoming/cms - create a new BlockTexte', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_BLOCKTEXT,
    );

    // THEN
    const faq = await TestUtil.prisma.blockText.findMany({});

    expect(response.status).toBe(201);
    expect(faq).toHaveLength(1);
    expect(faq[0].id_cms).toEqual('123');
    expect(faq[0].code).toEqual('456');
    expect(faq[0].titre).toEqual('The titre');
    expect(faq[0].texte).toEqual('The texte');
  });

  it('POST /api/incoming/cms - create a new tag', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_TAG,
    );

    // THEN
    const tag = await TestUtil.prisma.tag.findMany({});

    expect(response.status).toBe(201);
    expect(tag).toHaveLength(1);
    delete tag[0].updated_at;
    delete tag[0].created_at;
    expect(tag[0]).toEqual({
      boost: new Prisma.Decimal(20),
      description: 'The desc',
      id_cms: '123',
      ponderation: new Prisma.Decimal(3),
      label_explication: 'expli',
      tag: '456',
    });
  });

  it('POST /api/incoming/cms - create a new selection', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_SELECTION,
    );

    // THEN
    const selection = await TestUtil.prisma.selection.findMany({});

    expect(response.status).toBe(201);
    expect(selection).toHaveLength(1);
    delete selection[0].updated_at;
    delete selection[0].created_at;
    expect(selection[0]).toEqual({
      description: 'The desc',
      id_cms: '123',
      code: '456',
    });
  });

  it('POST /api/incoming/cms - create a new aide in aide table', async () => {
    // GIVEN
    await TestUtil.create(DB.partenaire, {
      content_id: '1',
      code_epci: '242100410',
      code_commune: '91477',
      code_departement: '123',
      code_region: '456',
    });
    await partenaireRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_AIDE,
    );

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(1);
    const aide = aides[0];
    delete aide.created_at;
    delete aide.updated_at;

    expect(aide).toEqual({
      besoin: 'broyer_vege',
      besoin_desc: 'Broyer ses végétaux',
      codes_commune_from_partenaire: TestUtil.CODE_COMMUNE_FROM_PARTENAIRE,
      codes_departement: ['78'],
      codes_departement_from_partenaire: ['123'],
      codes_postaux: ['91120', '75002'],
      codes_region: ['25'],
      codes_region_from_partenaire: ['456'],
      content_id: '123',
      contenu: "Contenu de l'aide",
      date_expiration: new Date(123),
      derniere_maj: new Date(123),
      echelle: null,
      est_gratuit: true,
      exclude_codes_commune: ['03', '04'],
      include_codes_commune: ['01', '02'],
      is_simulateur: true,
      montant_max: 123,
      partenaires_supp_ids: ['1'],
      thematiques: ['alimentation', 'climat'],
      titre: 'titre',
      url_demande: 'hihi',
      url_simulateur: '/aide/velo',
      url_source: 'haha',
      VISIBLE_PROD: true,
    });
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
    expect(item.short_question).toEqual('short question');
    expect(item.image_url).toEqual('https://');
    expect(item.id_cms).toEqual(123);
    expect(item.type).toEqual(TypeReponseQuestionKYC.choix_multiple);
    expect(item.categorie).toEqual(Categorie.mission);
    expect(item.points).toEqual(5);
    expect(item.unite).toEqual({
      abreviation: 'kg',
      long: 'kilogramme',
    });
    expect(item.emoji).toEqual('🔥');
    expect(item.is_ngc).toEqual(false);
    expect(item.a_supprimer).toEqual(true);
    expect(item.ngc_key).toEqual('a . b . c');
    expect(item.reponses).toEqual([
      {
        label: 'haha',
        code: 'haha_code',
        ngc_code: '123',
        value: 'haha',
      },
      {
        label: 'hihi',
        code: 'hihi_code',
        ngc_code: '456',
        value: 'hihi',
      },
    ]);
    expect(item.thematique).toEqual(Thematique.alimentation);
    expect(item.tags).toEqual([Tag.capacite_physique, Tag.possede_velo]);
    expect(item.conditions).toStrictEqual([
      [{ id_kyc: 8888, code_kyc: 'KYC06', code_reponse: 'yop' }],
    ]);
  });
  it('POST /api/incoming/cms - updates kyc', async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, { id_cms: 123 });
    await kycRepository.loadCache();

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
    expect(item.short_question).toEqual('short question');
    expect(item.image_url).toEqual('https://');
    expect(item.id_cms).toEqual(123);
    expect(item.type).toEqual(TypeReponseQuestionKYC.choix_multiple);
    expect(item.categorie).toEqual(Categorie.mission);
    expect(item.points).toEqual(5);
    expect(item.unite).toEqual({
      abreviation: 'kg',
      long: 'kilogramme',
    });
    expect(item.emoji).toEqual('🔥');
    expect(item.is_ngc).toEqual(false);
    expect(item.a_supprimer).toEqual(true);
    expect(item.ngc_key).toEqual('a . b . c');
    expect(item.reponses).toEqual([
      {
        label: 'haha',
        code: 'haha_code',
        ngc_code: '123',
        value: 'haha',
      },
      {
        label: 'hihi',
        code: 'hihi_code',
        ngc_code: '456',
        value: 'hihi',
      },
    ]);
    expect(item.thematique).toEqual(Thematique.alimentation);
    expect(item.tags).toEqual([Tag.capacite_physique, Tag.possede_velo]);
    expect(item.conditions).toStrictEqual([
      [{ id_kyc: 8888, code_kyc: 'KYC06', code_reponse: 'yop' }],
    ]);
  });

  it('POST /api/incoming/cms - create a new action', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ACTION,
    );

    // THEN
    const actions = await TestUtil.prisma.action.findMany({});

    expect(response.status).toBe(201);
    expect(actions).toHaveLength(1);
    const action = actions[0];
    expect(action.titre).toEqual('titre');
    expect(action.external_id).toEqual('ext_123');
    expect(action.partenaire_id).toEqual('1');
    expect(action.emoji).toEqual('🔥');
    expect(action.sous_titre).toEqual('sous-titre');
    expect(action.consigne).toEqual('Faites rapidement');
    expect(action.label_compteur).toEqual('tout le monde a déjà fait !');

    expect(action.besoins).toEqual(['composter', 'mieux_manger']);
    expect(action.tags_a_inclure_v2).toEqual(['CC', 'DD']);
    expect(action.tags_a_exclure_v2).toEqual(['AA', 'BB']);
    expect(action.comment).toEqual('comment');
    expect(action.quizz_felicitations).toEqual('Bravo !!');
    expect(action.pourquoi).toEqual('pourquoi');
    expect(action.quizz_ids).toEqual(['1', '2']);
    expect(action.articles_ids).toEqual(['9', '10']);
    expect(action.kyc_codes).toEqual(['KYC01', 'KYC02']);
    expect(action.faq_ids).toEqual(['5', '6']);
    expect(action.lvo_action).toEqual('donner');
    expect(action.lvo_objet).toEqual('phone');
    expect(action.recette_categorie).toEqual('vegan');
    expect(action.type).toEqual('quizz');
    expect(action.code).toEqual('code');
    expect(action.cms_id).toEqual('123');
    expect(action.sources).toEqual([{ label: 'haha', url: 'hoho' }]);
    expect(action.thematique).toEqual('alimentation');
    expect(action.sous_thematique).toEqual(
      SousThematique.logement_economie_energie,
    );
    expect(action.VISIBLE_PROD).toEqual(true);
    expect(action.pdcn_categorie).toEqual(CategorieRecherche.circuit_court);
  });

  it('POST /api/incoming/cms - create a new action bilan', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ACTION_BILAN,
    );

    // THEN
    const actions = await TestUtil.prisma.action.findMany({});

    expect(response.status).toBe(201);
    expect(actions).toHaveLength(1);
    const action = actions[0];
    expect(action.titre).toEqual('titre');
    expect(action.sous_titre).toEqual('sous-titre');
    expect(action.kyc_codes).toEqual(['KYC03', 'KYC04']);
    expect(action.type).toEqual(TypeAction.bilan);
    expect(action.code).toEqual('code');
    expect(action.cms_id).toEqual('123');
    expect(action.thematique).toEqual('alimentation');
  });

  it('POST /api/incoming/cms - delete when unpublish simulateur action', async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      cms_id: '1',
      type: TypeAction.simulateur,
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(DELETE_SIMU);

    // THEN
    const actions = await TestUtil.prisma.action.findMany({});

    expect(response.status).toBe(201);
    expect(actions).toHaveLength(0);
  });

  it('POST /api/incoming/cms - updates an action', async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      // @ts-ignore FIXME: remove this when we have a proper typing for action
      cms_id: '123',
      code: 'code',
      type: TypeAction.quizz,
    });

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ACTION,
    );

    // THEN
    const actions = await TestUtil.prisma.action.findMany({});

    expect(response.status).toBe(201);
    expect(actions).toHaveLength(1);
    const action = actions[0];
    expect(action.titre).toEqual('titre');
    expect(action.external_id).toEqual('ext_123');
    expect(action.partenaire_id).toEqual('1');
    expect(action.emoji).toEqual('🔥');
    expect(action.sous_titre).toEqual('sous-titre');
    expect(action.besoins).toEqual(['composter', 'mieux_manger']);
    expect(action.tags_a_exclure_v2).toEqual(['AA', 'BB']);
    expect(action.tags_a_inclure_v2).toEqual(['CC', 'DD']);
    expect(action.comment).toEqual('comment');
    expect(action.quizz_felicitations).toEqual('Bravo !!');
    expect(action.pourquoi).toEqual('pourquoi');
    expect(action.quizz_ids).toEqual(['1', '2']);
    expect(action.articles_ids).toEqual(['9', '10']);
    expect(action.kyc_codes).toEqual(['KYC01', 'KYC02']);
    expect(action.faq_ids).toEqual(['5', '6']);
    expect(action.lvo_action).toEqual('donner');
    expect(action.lvo_objet).toEqual('phone');
    expect(action.recette_categorie).toEqual('vegan');
    expect(action.recette_sous_categorie).toEqual('sans_saumon');
    expect(action.recette_sous_categorie).toEqual('sans_saumon');
    expect(action.type).toEqual('quizz');
    expect(action.code).toEqual('code');
    expect(action.cms_id).toEqual('123');
    expect(action.thematique).toEqual('alimentation');
    expect(action.sous_thematique).toEqual(
      SousThematique.logement_economie_energie,
    );
  });

  it('POST /api/incoming/cms - updates exisying aide in aide table', async () => {
    // GIVEN
    await TestUtil.create(DB.aide, { content_id: '123' });
    await TestUtil.create(DB.partenaire, {
      content_id: '1',
      code_epci: '242100410',
      code_commune: '91477',
      code_departement: '123',
      code_region: '456',
    });
    await partenaireRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_AIDE,
    );

    // THEN
    const aides = await TestUtil.prisma.aide.findMany({});

    expect(response.status).toBe(201);
    expect(aides).toHaveLength(1);
    const aide = aides[0];
    delete aide.updated_at;
    delete aide.created_at;

    expect(aide).toEqual({
      besoin: 'broyer_vege',
      besoin_desc: 'Broyer ses végétaux',
      codes_commune_from_partenaire: TestUtil.CODE_COMMUNE_FROM_PARTENAIRE,
      codes_departement: ['78'],
      codes_departement_from_partenaire: ['123'],
      codes_postaux: ['91120', '75002'],
      codes_region: ['25'],
      codes_region_from_partenaire: ['456'],
      content_id: '123',
      contenu: "Contenu de l'aide",
      date_expiration: new Date(123),
      derniere_maj: new Date(123),
      echelle: 'National',
      est_gratuit: true,
      exclude_codes_commune: ['03', '04'],
      include_codes_commune: ['01', '02'],
      is_simulateur: true,
      montant_max: 123,
      partenaires_supp_ids: ['1'],
      thematiques: ['alimentation', 'climat'],
      titre: 'titre',
      url_demande: 'hihi',
      url_simulateur: '/aide/velo',
      url_source: 'haha',
      VISIBLE_PROD: true,
    });
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
    expect(quizzes[0].partenaire_id).toEqual('1');
    expect(quizzes[0].rubrique_ids).toEqual(['1', '2']);
    expect(quizzes[0].rubrique_labels).toEqual(['A', 'B']);
    expect(quizzes[0].mois).toStrictEqual([0, 1]);
    expect(quizzes[0].article_id).toStrictEqual('1');
    expect(quizzes[0].questions).toStrictEqual({
      liste_questions: [
        {
          libelle: 'super question',
          reponses: [
            {
              est_bonne_reponse: true,
              reponse: 'a',
            },
            {
              est_bonne_reponse: false,
              reponse: 'b',
            },
          ],
          explication_ko: 'KO',
          explication_ok: 'OK',
        },
        {
          libelle: '2nd question',
          reponses: [
            {
              est_bonne_reponse: false,
              reponse: 'c',
            },
            {
              est_bonne_reponse: true,
              reponse: 'd',
            },
          ],
          explication_ko: 'KO_2',
          explication_ok: 'OK_2',
        },
      ],
    });
  });
  it('POST /api/incoming/cms - updates existing article in article table', async () => {
    // GIVEN
    await TestUtil.create(DB.article, { content_id: '123' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send(
      CMS_DATA_ARTICLE,
    );

    // THEN
    const articles = await TestUtil.prisma.article.findMany({});

    expect(response.status).toBe(201);
    expect(articles).toHaveLength(1);
    expect(articles[0].titre).toEqual('titre');
    expect(articles[0].derniere_maj).toEqual(new Date(123));
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
    expect(articles[0].mois).toStrictEqual([0, 1]);
    expect(articles[0].content_id).toEqual('123');
    expect(articles[0].partenaire_id).toEqual('1');
    expect(articles[0].rubrique_ids).toEqual(['1', '2']);
    expect(articles[0].rubrique_labels).toEqual(['A', 'B']);
    expect(articles[0].sources).toEqual([{ label: 'haha', url: 'hoho' }]);
    expect(articles[0].tags_a_exclure_v2).toEqual(['AA', 'BB']);
    expect(articles[0].tags_a_inclure_v2).toEqual(['CC', 'DD']);
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
    expect(quizzes[0].mois).toStrictEqual([0, 1]);
    expect(quizzes[0].content_id).toEqual('123');
    expect(quizzes[0].partenaire_id).toEqual('1');
    expect(quizzes[0].rubrique_ids).toEqual(['1', '2']);
    expect(quizzes[0].rubrique_labels).toEqual(['A', 'B']);
    expect(quizzes[0].article_id).toStrictEqual('1');
    expect(quizzes[0].questions).toStrictEqual({
      liste_questions: [
        {
          libelle: 'super question',
          reponses: [
            {
              est_bonne_reponse: true,
              reponse: 'a',
            },
            {
              est_bonne_reponse: false,
              reponse: 'b',
            },
          ],
          explication_ko: 'KO',
          explication_ok: 'OK',
        },
        {
          libelle: '2nd question',
          reponses: [
            {
              est_bonne_reponse: false,
              reponse: 'c',
            },
            {
              est_bonne_reponse: true,
              reponse: 'd',
            },
          ],
          explication_ko: 'KO_2',
          explication_ok: 'OK_2',
        },
      ],
    });
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
      entry: { id: 1, titre: 'yo', code: Thematique.logement },
    });

    // THEN
    expect(response.status).toBe(201);
    const thematiqueDB = await TestUtil.prisma.thematique.findMany({});
    expect(thematiqueDB).toHaveLength(1);
    expect(thematiqueDB[0].id_cms).toEqual(1);
    expect(thematiqueDB[0].titre).toEqual('yo');
    expect(thematiqueDB[0].code).toEqual('logement');
  });
  it('POST /api/incoming/cms - create 1 thematique', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.POST('/api/incoming/cms').send({
      ...CMS_DATA_ARTICLE,
      model: CMSModel.thematique,
      event: CMSEvent['entry.publish'],
      entry: {
        id: 1,
        label: 'yo',
        titre: 'titre',
        code: Thematique.climat,
        imageUrl: {
          formats: {
            thumbnail: { url: 'https://haha' },
          },
        },
        emoji: '🔥',
      },
    });

    // THEN
    expect(response.status).toBe(201);
    const universDB = await TestUtil.prisma.thematique.findMany({});
    expect(universDB).toHaveLength(1);
    expect(universDB[0].id_cms).toEqual(1);
    expect(universDB[0].label).toEqual('yo');
    expect(universDB[0].titre).toEqual('titre');
    expect(universDB[0].emoji).toEqual('🔥');
    expect(universDB[0].code).toEqual(Thematique.climat);
    expect(universDB[0].image_url).toEqual('https://haha');
  });

  it('POST /api/incoming/cms - updates existing article, 1 user in db ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, {
      content_id: '123',
      soustitre: 'hahah',
    });
    await articleRepository.loadCache();

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
