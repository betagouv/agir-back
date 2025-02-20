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
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { CodeMission } from '../../../src/domain/mission/codeMission';
import { Defi } from '.prisma/client';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { DefiRepository } from '../../../src/infrastructure/repository/defi.repository';
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
  accessible: true,
  motif: 'truc',
  categorie: Categorie.recommandation,
  mois: [],
  conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
  sont_points_en_poche: true,
  impact_kg_co2: 5,
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
  created_at: undefined,
  updated_at: undefined,
  categorie: Categorie.recommandation,
  mois: [],
  conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
  impact_kg_co2: 5,
};

describe('/utilisateurs/id/recommandations (API test)', () => {
  const kycRepository = new KycRepository(TestUtil.prisma);
  const defiRepository = new DefiRepository(TestUtil.prisma);
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await kycRepository.loadDefinitions();
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
    await TestUtil.create(DB.utilisateur, {
      history: {},
      logement: { version: 0, code_postal: '21000', commune: 'DIJON' },
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      codes_departement: ['21'],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      codes_departement: ['22'],
    });

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
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].content_id).toEqual('2');
    expect(response.body[1].content_id).toEqual('3');
    expect(response.body[2].content_id).toEqual('1');
  });
  it('GET /utilisateurs/id/recommandations - ponderations des articles ET prio aux contenus locaux', async () => {
    // GIVEN
    //CatalogueQuestionsKYC.setCatalogue([]);

    await TestUtil.create(DB.utilisateur, {
      history: {},
    });
    PonderationApplicativeManager.setCatalogue({
      neutre: {
        R1: 5,
        R2: 10,
        R3: 15,
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
      rubrique_ids: ['2'],
      codes_postaux: ['91120'],
    });
    await TestUtil.create(DB.article, {
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
    await kycRepository.loadDefinitions();

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
      '/utilisateurs/utilisateur-id/recommandations_v3',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].content_id).toEqual('1');
    expect(Math.round(response.body[0].score)).toEqual(350);
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

    await kycRepository.loadDefinitions();
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3',
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
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.recommandation,
      points: 10,
      question: `question hors recos`,
      thematique: Thematique.logement,
      reponses: [{ label: 'AAA', code: Thematique.climat }],
      tags: [Tag.R6, Tag.R1],
    });

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
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
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/logement/recommandations',
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
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/recommandations_v3?univers=logement',
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body).toHaveLength(0);
  });
});
