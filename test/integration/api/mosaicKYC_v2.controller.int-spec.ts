import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { Tag } from '../../../src/domain/scoring/tag';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import {
  MosaicKYC_CATALOGUE,
  MosaicKYCDef,
  TypeMosaic,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import {
  KYCHistory_v1,
  QuestionKYC_v1,
} from '../../../src/domain/object_store/kyc/kycHistory_v1';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';

const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
  {
    id: KYCMosaicID.TEST_MOSAIC_ID,
    categorie: Categorie.test,
    points: 5,
    titre: 'Titre test',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [KYCID._1, KYCID._2],
    thematique: Thematique.alimentation,
  },
];
describe('/utilisateurs/id/mosaicsKYC (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/id/questionsKY_v2/id - mosaic avec de questions du catalogue', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
      unite: Unite.kg,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      short_question: 'short 1',
      image_url: 'AAA',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      short_question: 'short 2',
      image_url: 'BBB',
      code: '_2',
    });
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });

    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual('Titre test');
    expect(response.body.is_answered).toEqual(false);
    expect(response.body.code).toEqual('TEST_MOSAIC_ID');
    expect(response.body.categorie).toEqual(Categorie.test);
    expect(response.body.points).toEqual(5);
    expect(response.body.type).toEqual(TypeMosaic.mosaic_boolean);
    expect(response.body.reponse_multiple).toHaveLength(2);

    expect(response.body.reponse_multiple[0].code).toEqual('_1');
    expect(response.body.reponse_multiple[0].label).toEqual('short 1');
    expect(response.body.reponse_multiple[0].image_url).toEqual('AAA');
    expect(response.body.reponse_multiple[0].emoji).toEqual('🔥');
    expect(response.body.reponse_multiple[0].value).toEqual('non');

    expect(response.body.reponse_multiple[1].code).toEqual('_2');
    expect(response.body.reponse_multiple[1].label).toEqual('short 2');
    expect(response.body.reponse_multiple[1].image_url).toEqual('BBB');
    expect(response.body.reponse_multiple[1].emoji).toEqual('🔥');
    expect(response.body.reponse_multiple[1].value).toEqual('non');
  });

  it('GET /utilisateurs/id/questionsKYC_v2/id - lecture mosaic avec reponses précédentes', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
      unite: Unite.kg,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
      short_question: 'short_1',
      image_url: 'AAA_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
      short_question: 'short_2',
      image_url: 'AAA_2',
    });

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: '_1',
          question: 'quest 1',
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'oui', label: 'Oui', value: 'oui' },
            { code: 'non', label: 'Non', value: 'non' },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              value: 'non',
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          thematiques: [Thematique.alimentation],
          reponse_simple: undefined,
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          code: '_2',
          question: 'quest 2',
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'non', label: 'Non', value: 'oui' },
            { code: 'oui', label: 'Oui', value: 'non' },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              value: 'non',
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          thematiques: [Thematique.alimentation],
          reponse_simple: undefined,
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'TEST_MOSAIC_ID',
      question: 'Titre test',
      is_answered: true,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_1',
          image_url: 'AAA_1',
          emoji: '🔥',
          unite: Unite.kg,
          value: 'oui',
        },
        {
          code: '_2',
          label: 'short_2',
          image_url: 'AAA_2',
          emoji: '🔥',
          unite: Unite.kg,
          value: 'non',
        },
      ],
      categorie: 'test',
      points: 5,
      is_NGC: false,
      type: 'mosaic_boolean',
      thematique: Thematique.alimentation,
    });
  });

  it('GET /utilisateurs/id/questionsKYC_v2/bad - mosaic inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/bad',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`Question d'id bad inconnue`);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/bad - MAJ mosaic inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/bad',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`Question d'id bad inconnue`);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await kycRepository.loadDefinitions();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', value: 'oui' },
      { code: '_2', value: 'non' },
    ]);

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.gamification.points).toEqual(15);

    expect(dbUser.kyc_history.answered_questions).toHaveLength(2);
    expect(dbUser.kyc_history.answered_questions[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: 'oui',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: 'non',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: 'non',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
      ],
      reponse_simple: null,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      thematiques: ['alimentation'],
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: Unite.kg,
    });
    expect(dbUser.kyc_history.answered_questions[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: 'non',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: 'oui',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: 'non',
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
      ],
      reponse_simple: null,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      thematiques: ['alimentation'],
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: Unite.kg,
    });
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic => 400 info manquante', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await kycRepository.loadDefinitions();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([{ code: '_1', value: 'oui' }]);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'le nombre de reponses attendu pour la mosaic [TEST_MOSAIC_ID] est de [2]',
    );
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic => 400 mauvais code', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await kycRepository.loadDefinitions();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', value: 'oui' },
      { code: 'bad', value: 'non' },
    ]);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Code réponse [bad] inconnu pour la KYC [TEST_MOSAIC_ID]',
    );
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic boolean alors que que les question sous jacente sont interger', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.entier,
      ngc_key: 'a . b . c',
      reponses: [],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await kycRepository.loadDefinitions();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', value: 'oui' },
      { code: '_2', value: 'non' },
    ]);

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.kyc_history.answered_questions).toHaveLength(2);
    expect(dbUser.kyc_history.answered_questions[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_simple: {
        unite: 'kg',
        value: '1',
      },
      reponse_complexe: undefined,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      thematiques: ['alimentation'],
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      emoji: '🔥',
    });
    expect(dbUser.kyc_history.answered_questions[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_simple: {
        unite: 'kg',
        value: '0',
      },
      reponse_complexe: undefined,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      thematiques: ['alimentation'],
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      emoji: '🔥',
    });
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic avec pas de réponses', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([]);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('072');
  });

  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic réponses manquantes', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v1() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send({});

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('072');
  });

  it('GET /utilisateurs/id/questionsKYC/id - lecture mosaic avec reponses précédentes de type integer', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Thematique.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.entier,
      ngc_key: 'a . b . c',
      reponses: [],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
      unite: Unite.kg,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
      short_question: 'short 1',
      image_url: 'AAA_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
      short_question: 'short 2',
      image_url: 'BBB_1',
    });

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: '_1',
          question: 'quest 1',
          type: TypeReponseQuestionKYC.entier,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_simple: { value: '0' },
          reponse_complexe: [],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          thematiques: [Thematique.alimentation],
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
        {
          code: '_2',
          question: 'quest 2',
          type: TypeReponseQuestionKYC.entier,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_simple: { value: '1' },
          reponse_complexe: undefined,
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          thematiques: [Thematique.alimentation],
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await kycRepository.loadDefinitions();
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'TEST_MOSAIC_ID',
      question: 'Titre test',
      is_NGC: false,
      is_answered: true,
      thematique: Thematique.alimentation,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short 1',
          image_url: 'AAA_1',
          emoji: '🔥',
          unite: Unite.kg,
          value: 'non',
        },
        {
          code: '_2',
          label: 'short 2',
          image_url: 'BBB_1',
          emoji: '🔥',
          unite: Unite.kg,
          value: 'oui',
        },
      ],
      categorie: 'test',
      points: 5,
      type: 'mosaic_boolean',
    });
  });

  // ####################################################################################
  // ##################################### KYC V2 #######################################
  // ####################################################################################

  const KYC_DB_DATA: KYC = {
    id_cms: 1,
    a_supprimer: true,
    categorie: Categorie.mission,
    conditions: undefined,
    emoji: 'a',
    image_url: 'img',
    is_ngc: true,
    ngc_key: 'a . b . c',
    points: 123,
    short_question: 'short',
    tags: [TagUtilisateur.appetence_bouger_sante],
    thematique: Thematique.dechet,
    unite: Unite.kg,
    type: TypeReponseQuestionKYC.choix_multiple,
    universes: [Thematique.climat],
    code: KYCID._2,
    question: `Quel est votre sujet principal d'intéret ?`,
    reponses: [
      { label: 'Le climat', code: Thematique.climat },
      { label: 'Mon logement', code: Thematique.logement },
      { label: 'Ce que je mange', code: Thematique.alimentation },
    ],
    created_at: undefined,
    updated_at: undefined,
  };

  const KYC_DATA: QuestionKYC_v1 = {
    code: '1',
    id_cms: 11,
    question: `question`,
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    a_supprimer: false,
    categorie: Categorie.test,
    points: 10,
    reponse_complexe: [
      {
        label: 'Le climat',
        code: Thematique.climat,
        value: 'oui',
      },
      {
        label: 'Mon logement',
        code: Thematique.logement,
        value: 'non',
      },
    ],
    reponse_simple: undefined,
    tags: [],
    thematiques: [Thematique.consommation],
    thematique: Thematique.consommation,
    ngc_key: '123',
    short_question: 'short',
    image_url: 'AAA',
    conditions: [],
    unite: Unite.kg,
    emoji: '🔥',
  };

  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie une mosaic depuis le catalogue`, async () => {
    // GIVEN
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre mosaic',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
        thematique: Thematique.alimentation,
      },
    ];
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: Unite.kg,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 1`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 2,
      code: KYCID._2,
      emoji: 'b',
      image_url: 'img_b',
      points: 456,
      short_question: 'short_b',
      unite: Unite.euro,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 2`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'TEST_MOSAIC_ID',
      question: 'Titre mosaic',
      is_answered: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: 'kg',
          value: 'non',
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: 'euro',
          value: 'non',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_NGC: false,
      thematique: 'alimentation',
    });
  });

  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie une mosaic depuis le catalogue, avec un KYC depuis l'historique, cas du non`, async () => {
    // GIVEN
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre mosaic',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
        thematique: Thematique.alimentation,
      },
    ];

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID._1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', value: 'non' },
            { label: 'Non', code: 'non', value: 'oui' },
            { label: 'Je sais pas', code: 'sais_pas', value: 'non' },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: Unite.kg,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 1`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 2,
      code: KYCID._2,
      emoji: 'b',
      image_url: 'img_b',
      points: 456,
      short_question: 'short_b',
      unite: Unite.euro,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 2`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'TEST_MOSAIC_ID',
      question: 'Titre mosaic',
      is_answered: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: 'kg',
          value: 'non',
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: 'euro',
          value: 'non',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_NGC: false,
      thematique: 'alimentation',
    });
  });

  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie une mosaic depuis le catalogue, avec un KYC depuis l'historique, cas du oui`, async () => {
    // GIVEN
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre mosaic',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
        thematique: Thematique.alimentation,
      },
    ];

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID._1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', value: 'oui' },
            { label: 'Non', code: 'non', value: 'non' },
            { label: 'Je sais pas', code: 'sais_pas', value: 'non' },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: Unite.kg,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 1`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 2,
      code: KYCID._2,
      emoji: 'b',
      image_url: 'img_b',
      points: 456,
      short_question: 'short_b',
      unite: Unite.euro,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `question 2`,
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      created_at: undefined,
      updated_at: undefined,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 'TEST_MOSAIC_ID',
      question: 'Titre mosaic',
      is_answered: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: 'kg',
          value: 'oui',
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: 'euro',
          value: 'non',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_NGC: false,
      thematique: 'alimentation',
    });
  });
});