import { Prisma } from '@prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ProfileRecommandationUtilisateur_v0 } from '../../../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import {
  ApplicativePonderationSetName,
  PonderationApplicativeManager,
} from '../../../src/domain/scoring/ponderationApplicative';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { Tag } from '../../../src/domain/scoring/tag';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { TagRepository } from '../../../src/infrastructure/repository/tag.repository';
import { DB, TestUtil } from '../../TestUtil';
const DAY_IN_MS = 1000 * 60 * 60 * 24;

describe('/utilisateurs/id/recommandations (API test)', () => {
  const kycRepository = new KycRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);
  const tagRepository = new TagRepository(TestUtil.prisma);
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await kycRepository.loadCache();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
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
    await articleRepository.loadCache();
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/autre-id/recommandations_v3',
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
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(401);
  });
  it('GET /utilisateurs/id/recommandation - list article recommandation', async () => {
    // GIVEN

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
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
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
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
  });

  it('GET /utilisateurs/id/recommandations - liste articles filtrés par departement', async () => {
    // GIVEN

    const logement: Logement_v0 = {
      chauffage: Chauffage.autre,
      code_postal: '21000',
      commune: 'DIJON',
      dpe: DPE.A,
      nombre_adultes: 1,
      nombre_enfants: 1,
      plus_de_15_ans: true,
      proprietaire: true,
      superficie: Superficie.superficie_150_et_plus,
      type: TypeLogement.appartement,
      version: 0,
      risques: undefined,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      history: {},
      logement: logement as any,
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement: ['21'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      codes_departement: ['22'],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
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
    await TestUtil.create(DB.tag, {
      id_cms: '1',
      tag: 't1',
      boost: new Prisma.Decimal(10),
    });
    await TestUtil.create(DB.tag, {
      id_cms: '2',
      tag: 't2',
      boost: new Prisma.Decimal(20),
    });
    await TestUtil.create(DB.tag, {
      id_cms: '3',
      tag: 't3',
      boost: new Prisma.Decimal(30),
    });
    await tagRepository.loadCache();

    await TestUtil.create(DB.article, {
      content_id: '1',
      tags_a_inclure_v2: ['t1'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tags_a_inclure_v2: ['t3'],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      tags_a_inclure_v2: ['t2'],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[1].content_id).toEqual('3');
    expect(response.body[2].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - article non visible en PROD', async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
      VISIBLE_PROD: false,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      VISIBLE_PROD: true,
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('2');
  });
  it('GET /utilisateurs/id/recommandations - article visible en DEV', async () => {
    // GIVEN
    process.env.IS_PROD = 'false';

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
      VISIBLE_PROD: false,
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      VISIBLE_PROD: true,
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
  it('GET /utilisateurs/id/recommandations - ponderations des articles ET prio aux contenus locaux', async () => {
    // GIVEN
    await TestUtil.create(DB.tag, {
      id_cms: '1',
      tag: 't1',
      boost: new Prisma.Decimal(5),
    });
    await TestUtil.create(DB.tag, {
      id_cms: '2',
      tag: 't2',
      boost: new Prisma.Decimal(10),
    });
    await TestUtil.create(DB.tag, {
      id_cms: '3',
      tag: 't3',
      boost: new Prisma.Decimal(15),
    });
    await tagRepository.loadCache();

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });

    await TestUtil.create(DB.article, {
      content_id: '1',
      tags_a_inclure_v2: ['t1'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tags_a_inclure_v2: ['t2'],
      codes_postaux: ['91120'],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      tags_a_inclure_v2: ['t3'],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
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
    });
    await TestUtil.create(DB.utilisateur, {
      history: {},
      tag_ponderation_set: { climat: 100, consommation: 50 },
      kyc: {
        version: 0,
        answered_questions: [],
      },
    });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
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
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('3');
    expect(response.body[1].content_id).toEqual('2');
    expect(response.body[2].content_id).toEqual('1');
  });

  it('GET /utilisateurs/id/recommandations - tag logement en boost renforce le score', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);
    const recommandation: ProfileRecommandationUtilisateur_v0 = {
      liste_tags_actifs: [Tag_v2.a_un_jardin],
      version: 0,
    };
    await TestUtil.create(DB.utilisateur, {
      history: {},
      recommandation: recommandation as any,
    });
    await TestUtil.create(DB.tag, {
      tag: Tag_v2.a_un_jardin,
      boost: new Prisma.Decimal(50),
    });
    await tagRepository.loadCache();

    await TestUtil.create(DB.article, {
      content_id: '1',
      rubrique_ids: [],
      thematiques: [Thematique.logement],
      tags_a_inclure_v2: [Tag_v2.a_un_jardin],
    });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(Math.round(response.body[0].score)).toEqual(60);
  });

  it('GET /utilisateurs/id/recommandations v2 - pas de contenu de categorie non recommandation', async () => {
    // GIVEN

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
    });

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
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
    await articleRepository.loadCache();
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3?univers=logement',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(0);
  });

  it('GET /utilisateurs/id/recommandations_v3 - que des articles si filtre articles seuls', async () => {
    // GIVEN
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
    });

    await TestUtil.create(DB.utilisateur, {
      tag_ponderation_set: { R1: 5, R2: 4, R3: 3, R4: 2, R5: 1, R6: 6 },
    });
    await TestUtil.create(DB.quizz, {
      content_id: '11',
      codes_postaux: [],
      rubrique_ids: ['1'],
    });
    await TestUtil.create(DB.article, {
      content_id: '44',
      codes_postaux: [],
      rubrique_ids: ['4'],
    });
    await articleRepository.loadCache();

    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3?type=article',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('44');
  });

  it('GET /utilisateurs/id/recommandations_v3 - nombre max de résultats', async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.article, { content_id: '3' });
    await TestUtil.create(DB.article, { content_id: '4' });
    await TestUtil.create(DB.article, { content_id: '5' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3?nombre_max=3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
  });
});
