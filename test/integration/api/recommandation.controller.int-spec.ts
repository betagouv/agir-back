import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/recommandations (API test)', () => {
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

  it('GET /utilisateurs/id/recommandation - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('article');
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/autre-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateurs/id/recommandation - list article recommandation', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('article');

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
  it('GET /utilisateurs/id/recommandation - list article recommandation', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {} });
    await TestUtil.create('quizz');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(response.body[0].titre).toEqual('titreQ');
    expect(response.body[0].soustitre).toEqual('sousTitre');
    expect(response.body[0].type).toEqual('quizz');
    expect(response.body[0].thematique_principale).toEqual('climat');
    expect(response.body[0].duree).toEqual('pas long');
    expect(response.body[0].image_url).toEqual('https://');
    expect(response.body[0].points).toEqual(10);
  });
  it('GET /utilisateurs/id/interactions - list all recos, filtée par code postal', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { history: {}, code_postal: '123' });
    await TestUtil.create('article', {
      content_id: '1',
      codes_postaux: ['123'],
    });
    await TestUtil.create('article', {
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
  it('GET /utilisateurs/id/interactions - applique les ponderations aux articles', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      history: {},
      code_postal: null,
      version_ponderation: 0,
    });
    await TestUtil.create('ponderation', {
      version: 0,
      rubriques: {
        '1': 10,
        '2': 20,
        '3': 30,
      },
    });

    await TestUtil.create('article', {
      content_id: '1',
      rubrique_ids: ['1'],
    });
    await TestUtil.create('article', {
      content_id: '2',
      rubrique_ids: ['3'],
    });
    await TestUtil.create('article', {
      content_id: '3',
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
    expect(response.body[1].content_id).toEqual('3');
  });
  it('GET /utilisateurs/id/interactions - applique les ponderations aux quizz, avec groupement par difficulté', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      history: {},
      code_postal: null,
      version_ponderation: 0,
    });
    await TestUtil.create('ponderation', {
      version: 0,
      rubriques: {
        '1': 10,
        '2': 20,
        '3': 30,
      },
    });

    await TestUtil.create('quizz', {
      content_id: '1',
      rubrique_ids: ['1'],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      rubrique_ids: ['2'],
      difficulty: DifficultyLevel.L1,
    });
    await TestUtil.create('quizz', {
      content_id: '3',
      rubrique_ids: ['3'],
      difficulty: DifficultyLevel.L2,
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
  it('GET /utilisateurs/id/interactions - pas de article lu', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('article', {
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create('article', {
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
  it('GET /utilisateurs/id/interactions - que des quizz jamais touchés', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      history: {
        quizz_interactions: [
          { content_id: '1', attempts: [{ date: new Date(), score: 100 }] },
          { content_id: '2', attempts: [{ date: new Date(), score: 30 }] },
        ],
      },
    });
    await TestUtil.create('quizz', {
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create('quizz', {
      content_id: '2',
      codes_postaux: [],
    });
    await TestUtil.create('quizz', {
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
});
