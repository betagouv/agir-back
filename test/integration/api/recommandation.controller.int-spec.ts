import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  CategorieQuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../src/domain/scoring/ponderationApplicative';
import { DB, TestUtil } from '../../TestUtil';

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
    await TestUtil.create_article();
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/autre-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/recommandation - list article recommandation', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { history: {} });
    await TestUtil.create_article();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
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
  it('GET /utilisateurs/id/recommandations - list all recos, filtée par code postal', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      logement: { version: 0, code_postal: '123' },
    });
    await TestUtil.create_article({
      content_id: '1',
      codes_postaux: ['123'],
    });
    await TestUtil.create_article({
      content_id: '2',
      codes_postaux: ['456'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - applique les ponderations aux articles', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
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

    await TestUtil.create_article({
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create_article({
      content_id: '2',
      rubrique_ids: ['3'],
    });
    await TestUtil.create_article({
      content_id: '3',
      rubrique_ids: ['2'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[1].content_id).toEqual('3');
    expect(response.body[2].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - applique les ponderations aux quizz', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
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

    await TestUtil.create_quizz({
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create_quizz({
      content_id: '2',
      rubrique_ids: ['2'],
    });
    await TestUtil.create_quizz({
      content_id: '3',
      rubrique_ids: ['3'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
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
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
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

    await TestUtil.create_quizz({
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create_article({
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
    expect(response.body[0].score).toEqual(100);
    expect(response.body[1].content_id).toEqual('2');
    expect(response.body[1].score).toEqual(20);
    expect(response.body[2].content_id).toEqual('1');
    expect(response.body[2].score).toEqual(10);
  });
  it('GET /utilisateurs/id/recommandations - renvoie un défis en premier car tag climat ++', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
      tag_ponderation_set: {},
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

    await TestUtil.create_quizz({
      content_id: '1',
      rubrique_ids: ['1'],
      thematiques: [Thematique.logement],
    });
    await TestUtil.create_article({
      content_id: '2',
      rubrique_ids: ['2'],
      thematiques: [Thematique.dechet],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('101');
    expect(response.body[0].score).toEqual(300);
    expect(response.body[1].content_id).toEqual('2');
    expect(response.body[1].score).toEqual(200);
    expect(response.body[2].content_id).toEqual('1');
    expect(response.body[2].score).toEqual(100);
  });
  it('GET /utilisateurs/id/recommandations - tag climat 2 fois renforce le score', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body[0].content_id).toEqual('101');
    expect(response.body[0].score).toEqual(350);
  });
  it('GET /utilisateurs/id/recommandations - ne renvoie pas le défi si KYC dejà répondu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {},
      code_postal: null,
      tag_ponderation_set: { utilise_moto_ou_voiture: 100 },
      kyc: {
        version: 0,
        answered_questions: [
          {
            id: '101', // ID du prermier défi
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: CategorieQuestionKYC.service,
            points: 10,
            reponse: ['Le climat'],
            reponses_possibles: [
              'Le climat',
              'Mon logement',
              'Ce que je mange',
            ],
            tags: [],
          },
        ],
      },
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

    await TestUtil.create_quizz({
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create_article({
      content_id: '2',
      rubrique_ids: ['2'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[1].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - pas de article lu', async () => {
    // GIVEN
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
    await TestUtil.create_article({
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create_article({
      content_id: '2',
      codes_postaux: [],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[0].type).toEqual('article');
  });
  it('GET /utilisateurs/id/recommandations - que des quizz jamais touchés', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 30 }] },
        ],
      },
    });
    await TestUtil.create_quizz({
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create_quizz({
      content_id: '2',
      codes_postaux: [],
    });
    await TestUtil.create_quizz({
      content_id: '3',
      codes_postaux: [],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations?exclude_defi=true',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('3');
  });
});
