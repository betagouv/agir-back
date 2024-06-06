import { DefiStatus } from '../../../src/domain/defis/defi';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Tag } from '../../../src/domain/scoring/tag';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../src/domain/scoring/ponderationApplicative';
import { DB, TestUtil } from '../../TestUtil';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionQYC';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../src/domain/univers/univers';
import { Defi } from '.prisma/client';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const DEFI_1: Defi_v0 = {
  id: '1',
  points: 5,
  tags: [Tag.utilise_moto_ou_voiture],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  status: DefiStatus.en_cours,
  universes: [Univers.climat],
  accessible: true,
  motif: 'truc',
  categorie: Categorie.recommandation,
  mois: [],
  conditions: [[{ code_kyc: '123', code_reponse: 'oui' }]],
};
const DEFI_1_DEF: Defi = {
  content_id: '1',
  points: 5,
  tags: [Tag.utilise_moto_ou_voiture],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  universes: [Univers.climat],
  thematiquesUnivers: [ThematiqueUnivers.dechets_compost],
  created_at: undefined,
  updated_at: undefined,
  categorie: Categorie.recommandation,
  mois: [],
  conditions: [[{ code_kyc: '123', code_reponse: 'oui' }]],
};

describe('/utilisateurs/id/recommandations (API test)', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.PONDERATION_RUBRIQUES = ApplicativePonderationSetName.neutre;
  });

  afterEach(() => {
    PonderationApplicativeManager.resetCatalogue();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/recommandation - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });
    await TestUtil.create(DB.article);
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/autre-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/recommandation - 401 si force reconnexion', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {},
      force_connexion: true,
    });
    await TestUtil.create(DB.article);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(401);
  });
  it('GET /utilisateurs/id/recommandation - list article recommandation', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, { history: {} });
    await TestUtil.create(DB.article, {
      content_id: '1',
      titre: 'titreA',
      soustitre: 'sousTitre',
      thematique_principale: Thematique.climat,
      duree: 'pas long',
      image_url: 'https://',
      points: 10,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(response.body[0].titre).toEqual('titreA');
    expect(response.body[0].soustitre).toEqual('sousTitre');
    expect(response.body[0].type).toEqual('article');
    expect(response.body[0].thematique_principale).toEqual('climat');
    expect(response.body[0].duree).toEqual('pas long');
    expect(response.body[0].image_url).toEqual('https://');
    expect(response.body[0].points).toEqual(10);
  });
  it('GET /utilisateurs/id/recommandation - list un defi, bonne données', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF });
    //CatalogueQuestionsKYC.setCatalogue([]);
    await TestUtil.create(DB.utilisateur, {
      history: {},
      defis: {
        defis: [DEFI_1],
      },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(response.body[0].titre).toEqual('titre');
    expect(response.body[0].type).toEqual('defi');
    expect(response.body[0].thematique_principale).toEqual('alimentation');
    expect(response.body[0].image_url).toEqual(
      'https://res.cloudinary.com/dq023imd8/image/upload/v1711467455/Illustration_defis_63f2bfed5a.svg',
    );
    expect(response.body[0].points).toEqual(5);
    expect(response.body[0].status_defi).toEqual(DefiStatus.en_cours);
    expect(response.body[0].jours_restants).toEqual(4);
  });
  it('GET /utilisateurs/id/recommandations - list all recos, filtée par code postal', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {},
      logement: { version: 0, code_postal: '123' },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: ['123'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      codes_postaux: ['456'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - applique les ponderations aux articles', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        R1: 10,
        R2: 20,
        R3: 30,
      },
      noel: {},
      exp: {},
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      rubrique_ids: ['3'],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      rubrique_ids: ['2'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[1].content_id).toEqual('3');
    expect(response.body[2].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - renvoie qu une KYC, la mieux notée', async () => {
    // GIVEN
    process.env.KYC_RECO_ENABLED = 'true';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.recommandation,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [],
      tags: [],
      universes: [],
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.recommandation,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.climat,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [],
      universes: [],
    });
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { climat: 100, consommation: 50 },
      kyc: {
        version: 0,
        answered_questions: [],
      },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('_2');
    expect(response.body[0].score).toBeGreaterThan(100);
  });
  it('GET /utilisateurs/id/recommandations - applique les ponderations aux quizz', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        R1: 10,
        R2: 20,
        R3: 30,
      },
      noel: {},
      exp: {},
    });

    await TestUtil.create(DB.quizz, {
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      rubrique_ids: ['2'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '3',
      rubrique_ids: ['3'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('3');
    expect(response.body[1].content_id).toEqual('2');
    expect(response.body[2].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - renvoie un défis en premier', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '101' });

    //CatalogueQuestionsKYC.setCatalogue([]);
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { utilise_moto_ou_voiture: 100 },
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        R1: 10,
        R2: 20,
        R3: 30,
      },
      noel: {},
      exp: {},
    });

    await TestUtil.create(DB.quizz, {
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      rubrique_ids: ['2'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('101');
    expect(Math.round(response.body[0].score)).toEqual(100);
    expect(response.body[1].content_id).toEqual('2');
    expect(Math.round(response.body[1].score)).toEqual(20);
    expect(response.body[2].content_id).toEqual('1');
    expect(Math.round(response.body[2].score)).toEqual(10);
  });
  it('GET /utilisateurs/id/recommandations - renvoie pas de défis si feature non active', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [],
    };
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '101' });

    //CatalogueQuestionsKYC.setCatalogue([]);
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { utilise_moto_ou_voiture: 100 },
      unlocked_features: unlocked,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/recommandations - tag climat 2 fois renforce le score', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { transport: 50 },
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        logement: 100,
        transport: 300,
        dechet: 200,
      },
      noel: {},
      exp: {},
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      rubrique_ids: [],
      thematiques: [Thematique.transport],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(Math.round(response.body[0].score)).toEqual(350);
  });
  it('GET /utilisateurs/id/recommandations - pas de article lu', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(123).toISOString(),
          },
        ],
      },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      codes_postaux: [],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[0].type).toEqual('article');
  });
  it('GET /utilisateurs/id/recommandations - que des quizz jamais touchés', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);
    await TestUtil.create(DB.utilisateur, {
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 30 }] },
        ],
      },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '2',
      codes_postaux: [],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '3',
      codes_postaux: [],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('3');
  });
  it('GET /utilisateurs/id/recommandations - mix de defis en cours, restant, et articles', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.recommandation,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [Tag.R6],
      universes: [],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.consommation,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
      universes: [],
    });

    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [Tag.R1],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [Tag.R2],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [Tag.R3],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '4',
      tags: [Tag.R4],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '5',
      tags: [Tag.R5],
    });

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      tag_ponderation_set: { R1: 5, R2: 4, R3: 3, R4: 2, R5: 1, R6: 6 },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      rubrique_ids: ['2'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '33',
      codes_postaux: [],
      rubrique_ids: ['3'],
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      rubrique_ids: ['4'],
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      rubrique_ids: ['5'],
    });
    await TestUtil.create(DB.article, {
      content_id: '66',
      codes_postaux: [],
      rubrique_ids: ['6', '5'],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
    expect(response.body[0].content_id).toEqual('001');
    expect(response.body[1].content_id).toEqual('1');
    expect(response.body[2].content_id).toEqual('2');
    expect(response.body[3].content_id).toEqual('66');
    expect(response.body[4].content_id).toEqual('_1');
    expect(response.body[5].content_id).toEqual('11');
  });
  it('GET /utilisateurs/id/recommandations - rien hors categorie recommandation', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.mission,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [Tag.R6],
      universes: [],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.consommation,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
      universes: [],
    });

    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [Tag.R1],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [Tag.R2],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [Tag.R3],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '4',
      tags: [Tag.R4],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '5',
      tags: [Tag.R5],
      categorie: Categorie.mission,
    });

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      tag_ponderation_set: { R1: 5, R2: 4, R3: 3, R4: 2, R5: 1, R6: 6 },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      rubrique_ids: ['1'],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      rubrique_ids: ['2'],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '33',
      codes_postaux: [],
      rubrique_ids: ['3'],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      rubrique_ids: ['4'],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      rubrique_ids: ['5'],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '66',
      codes_postaux: [],
      rubrique_ids: ['6', '5'],
      categorie: Categorie.mission,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });
  it('GET /utilisateurs/id/recommandations v2 - mix KYC ARTICLE ET QUIZZ sans défis', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.recommandation,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [Tag.R6],
      universes: [],
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.consommation,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
      universes: [],
    });

    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [Tag.R1],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [Tag.R2],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [Tag.R3],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '4',
      tags: [Tag.R4],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '5',
      tags: [Tag.R5],
    });

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      tag_ponderation_set: { R1: 5, R2: 4, R3: 3, R4: 2, R5: 1, R6: 6 },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      rubrique_ids: ['2'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '33',
      codes_postaux: [],
      rubrique_ids: ['3'],
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      rubrique_ids: ['4'],
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      rubrique_ids: ['5'],
    });
    await TestUtil.create(DB.article, {
      content_id: '66',
      codes_postaux: [],
      rubrique_ids: ['6', '5'],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v2',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
    expect(response.body[0].content_id).toEqual('66');
    expect(response.body[1].content_id).toEqual('_1');
    expect(response.body[2].content_id).toEqual('11');
    expect(response.body[3].content_id).toEqual('22');
    expect(response.body[4].content_id).toEqual('33');
    expect(response.body[5].content_id).toEqual('44');
  });
  it('GET /utilisateurs/id/recommandations v2 - filtrage par univers (anciennement thémaiques)', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.recommandation,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [Tag.R6],
      universes: [Univers.climat],
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.recommandation,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.consommation,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
      universes: [Univers.logement],
    });

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_questions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      thematiques: [Thematique.logement],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v2?univers=logement',
    );
    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('_2');
    expect(response.body[1].content_id).toEqual('55');
    expect(response.body[2].content_id).toEqual('22');
  });
  it('GET /utilisateurs/id/recommandations v2 - pas de contenu de categorie non recommandation', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.mission,
      points: 10,
      question: `Quel est votre sujet principal d'intéret ?`,
      thematique: Thematique.consommation,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
        { label: 'CCC', code: Thematique.alimentation },
        { label: 'DDD', code: Thematique.transport },
      ],
      tags: [Tag.R6],
      universes: [Univers.climat],
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.consommation,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
      universes: [Univers.logement],
    });

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_questions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      thematiques: [Thematique.climat],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      thematiques: [Thematique.logement],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      thematiques: [Thematique.climat],
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      thematiques: [Thematique.logement],
      categorie: Categorie.mission,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v2?univers=logement',
    );
    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs/id/recommandations - que des defis en cours', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    process.env.KYC_RECO_ENABLED = 'true';

    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '004',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '005',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '006',
          status: DefiStatus.en_cours,
        },
      ],
    };
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [Tag.R1],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [Tag.R2],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [Tag.R3],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '4',
      tags: [Tag.R4],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '5',
      tags: [Tag.R5],
    });

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      tag_ponderation_set: { R1: 5, R2: 4, R3: 3, R4: 2, R5: 1, R6: 6 },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '22',
      codes_postaux: [],
      rubrique_ids: ['2'],
    });
    await TestUtil.create(DB.quizz, {
      content_id: '33',
      codes_postaux: [],
      rubrique_ids: ['3'],
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      rubrique_ids: ['4'],
    });
    await TestUtil.create(DB.article, {
      content_id: '55',
      codes_postaux: [],
      rubrique_ids: ['5'],
    });
    await TestUtil.create(DB.article, {
      content_id: '66',
      codes_postaux: [],
      rubrique_ids: ['6'],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(6);
    expect(response.body[0].content_id).toEqual('001');
    expect(response.body[1].content_id).toEqual('002');
    expect(response.body[2].content_id).toEqual('003');
    expect(response.body[3].content_id).toEqual('004');
    expect(response.body[4].content_id).toEqual('005');
    expect(response.body[5].content_id).toEqual('006');
  });
  it('GET /utilisateurs/id/recommandations - pas de defi à - de -50 points', async () => {
    // GIVEN
    process.env.DEFI_ENABLED = 'true';
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [Tag.climat],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [Tag.logement],
    });
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { climat: 100, logement: -60 },
      kyc: {
        version: 0,
        answered_questions: [],
      },
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
  });
});
