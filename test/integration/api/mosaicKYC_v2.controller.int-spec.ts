import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  KYCMosaicID,
  MosaicDefinition,
} from '../../../src/domain/kyc/mosaicDefinition';
import { MosaicKYCDef, TypeMosaic } from '../../../src/domain/kyc/mosaicKYC';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { ExplicationScore } from '../../../src/domain/scoring/system_v2/ExplicationScore';
import { Tag } from '../../../src/domain/scoring/tag';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

const MOSAIC_DEF: MosaicKYCDef = {
  id: KYCMosaicID.TEST_MOSAIC_ID,
  categorie: Categorie.test,
  points: 5,
  titre: 'Titre test',
  type: TypeMosaic.mosaic_boolean,
  question_kyc_codes: [KYCID._1, KYCID._2],
  thematique: Thematique.alimentation,
};

describe('/utilisateurs/id/mosaicsKYC (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });

    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;
    await kycRepository.loadCache();

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

    expect(response.body.reponse_multiple).toEqual([
      {
        code: '_1',
        emoji: '🔥',
        image_url: 'AAA',
        label: 'short 1',
        selected: false,
        unite: { abreviation: 'kg' },
      },
      {
        code: '_2',
        emoji: '🔥',
        image_url: 'BBB',
        label: 'short 2',
        selected: false,
        unite: { abreviation: 'kg' },
      },
    ]);
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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: '_1',
          question: 'quest 1',
          sous_titre: 'sous',
          last_update: undefined,
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'oui', label: 'Oui', selected: true },
            { code: 'non', label: 'Non', selected: false },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              selected: false,
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          reponse_simple: undefined,
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
        {
          code: '_2',
          question: 'quest 2',
          sous_titre: 'sous',
          last_update: undefined,
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'non', label: 'Non', selected: true },
            { code: 'oui', label: 'Oui', selected: false },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              selected: false,
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          reponse_simple: undefined,
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });

    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;
    await kycRepository.loadCache();

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
      is_mandatory: false,
      is_skipped: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_1',
          image_url: 'AAA_1',
          emoji: '🔥',
          unite: { abreviation: 'kg' },
          selected: true,
        },
        {
          code: '_2',
          label: 'short_2',
          image_url: 'AAA_2',
          emoji: '🔥',
          unite: { abreviation: 'kg' },
          selected: false,
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
    ).send({});

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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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
    await kycRepository.loadCache();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', selected: true },
      { code: '_2', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.kyc_history.getAnsweredKYCs()).toHaveLength(2);

    delete dbUser.kyc_history.getAnsweredKYCs()[0].last_update;
    delete dbUser.kyc_history.getAnsweredKYCs()[1].last_update;

    expect(dbUser.kyc_history.getAnsweredKYCs()[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      sous_titre: 'sous',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      is_skipped: false,
      is_answered: false,
      is_mandatory: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: undefined,
          selected: true,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: undefined,
          selected: false,
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
      pourcent_match: 0,
      explicationScore: {
        liste_explications: [],
      },
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: { abreviation: 'kg' },
    });
    expect(dbUser.kyc_history.getAnsweredKYCs()[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      sous_titre: 'sous',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      is_skipped: false,
      is_answered: false,
      is_mandatory: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: undefined,
          selected: true,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: undefined,
          selected: false,
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
      pourcent_match: 0,
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: { abreviation: 'kg' },
      explicationScore: {
        liste_explications: [],
      },
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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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
    await kycRepository.loadCache();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([{ code: '_1', selected: true }]);

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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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
    await kycRepository.loadCache();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', selected: true },
      { code: 'bad', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Code réponse [bad] inconnu pour la KYC [TEST_MOSAIC_ID]',
    );
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic boolean alors que les question sous jacente sont interger', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.entier,
      ngc_key: 'a . b . c',
      reponses: [],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: { abreviation: 'kg' },
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
    await kycRepository.loadCache();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', selected: true },
      { code: '_2', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.kyc_history.getAnsweredKYCs()).toHaveLength(2);

    delete dbUser.kyc_history.getAnsweredKYCs()[0].last_update;
    delete dbUser.kyc_history.getAnsweredKYCs()[1].last_update;

    expect(dbUser.kyc_history.getAnsweredKYCs()[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      sous_titre: 'sous',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      is_skipped: false,
      is_answered: false,
      is_mandatory: false,
      reponse_simple: {
        value: '1',
        unite: {
          abreviation: 'kg',
        },
      },
      reponse_complexe: [],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      pourcent_match: 0,
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: { abreviation: 'kg' },
      emoji: '🔥',
      explicationScore: new ExplicationScore(),
    });
    expect(dbUser.kyc_history.getAnsweredKYCs()[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      sous_titre: 'sous',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      is_skipped: false,
      is_answered: false,
      is_mandatory: false,
      reponse_simple: {
        value: '0',
        unite: {
          abreviation: 'kg',
        },
      },
      reponse_complexe: [],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      pourcent_match: 0,
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: { abreviation: 'kg' },
      emoji: '🔥',
      explicationScore: new ExplicationScore(),
    });
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/id - maj mosaic avec pas de réponses', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

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
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() as any });
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

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
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.entier,
      ngc_key: 'a . b . c',
      reponses: [],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
      unite: { abreviation: 'kg' },
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: '_1',
          last_update: undefined,
          question: 'quest 1',
          sous_titre: 'sous',
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
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
        {
          code: '_2',
          last_update: undefined,
          question: 'quest 2',
          sous_titre: 'sous',
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
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });
    await kycRepository.loadCache();
    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;

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
      is_mandatory: false,
      is_skipped: false,
      thematique: Thematique.alimentation,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short 1',
          image_url: 'AAA_1',
          emoji: '🔥',
          unite: { abreviation: 'kg' },
          selected: false,
        },
        {
          code: '_2',
          label: 'short 2',
          image_url: 'BBB_1',
          emoji: '🔥',
          unite: { abreviation: 'kg' },
          selected: true,
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
    sous_titre: 'sous',
    tags: [TagUtilisateur.appetence_bouger_sante],
    thematique: Thematique.dechet,
    unite: { abreviation: 'kg' },
    type: TypeReponseQuestionKYC.choix_multiple,
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

  const KYC_DATA: QuestionKYC_v2 = {
    code: '1',
    id_cms: 11,
    last_update: undefined,
    question: `question`,
    sous_titre: 'sous',
    type: TypeReponseQuestionKYC.choix_unique,
    is_NGC: false,
    a_supprimer: false,
    categorie: Categorie.test,
    points: 10,
    reponse_complexe: [
      {
        label: 'Le climat',
        code: Thematique.climat,
        selected: true,
      },
      {
        label: 'Mon logement',
        code: Thematique.logement,
        selected: false,
      },
    ],
    reponse_simple: undefined,
    tags: [],
    thematique: Thematique.consommation,
    ngc_key: '123',
    short_question: 'short',
    image_url: 'AAA',
    conditions: [],
    unite: { abreviation: 'kg' },
    emoji: '🔥',
  };

  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie une mosaic depuis le catalogue`, async () => {
    // GIVEN
    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre mosaic',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._1, KYCID._2],
      thematique: Thematique.alimentation,
    };
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'euro' },
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
    await kycRepository.loadCache();

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
      is_mandatory: false,
      is_skipped: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: { abreviation: 'kg' },
          selected: false,
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: { abreviation: 'euro' },
          selected: false,
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_NGC: false,
      thematique: 'alimentation',
    });
  });

  it(`Gpuis l'historique, cas du non`, async () => {
    // GIVEN
    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre mosaic',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._1, KYCID._2],
      thematique: Thematique.alimentation,
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],

      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID._1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: false },
            { label: 'Non', code: 'non', selected: true },
            {
              label: 'Je sais pas',
              code: 'sais_pas',
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'euro' },
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
    await kycRepository.loadCache();

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
      is_mandatory: false,
      is_skipped: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: { abreviation: 'kg' },
          selected: false,
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: { abreviation: 'euro' },
          selected: false,
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
    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre mosaic',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._1, KYCID._2],
      thematique: Thematique.alimentation,
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],

      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID._1,
          type: TypeReponseQuestionKYC.choix_unique,
          reponse_complexe: [
            { label: 'Oui', code: 'oui', selected: true },
            { label: 'Non', code: 'non', selected: false },
            {
              label: 'Je sais pas',
              code: 'sais_pas',
              selected: false,
            },
          ],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'euro' },
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
    await kycRepository.loadCache();

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
      is_mandatory: false,
      is_skipped: false,
      reponse_multiple: [
        {
          code: '_1',
          label: 'short_a',
          emoji: 'a',
          image_url: 'img_a',
          unite: { abreviation: 'kg' },
          selected: true,
        },
        {
          code: '_2',
          label: 'short_b',
          emoji: 'b',
          image_url: 'img_b',
          unite: { abreviation: 'euro' },
          selected: false,
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_NGC: false,
      thematique: 'alimentation',
    });
  });

  it('POST /utilisateurs/id/questionsKYC_v2/1/skip - passe une mosaic', async () => {
    // GIVEN
    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre mosaic',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._1, KYCID._2],
      thematique: Thematique.alimentation,
    };
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'euro' },
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
    await kycRepository.loadCache();
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID/skip',
    );

    // THEN
    expect(response.status).toBe(201);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    const kyc_ = user.kyc_history.getUpToDateMosaicById(
      KYCMosaicID.TEST_MOSAIC_ID,
    );

    expect(kyc_.is_skipped).toStrictEqual(true);
    expect(kyc_.is_answered).toStrictEqual(false);
  });

  it(`POST /utilisateurs/id/questionsKYC_v2/1/skip - mosaic skipped perd l'état une fois répondu`, async () => {
    // GIVEN
    MosaicDefinition.TEST_MOSAIC_ID = {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre mosaic',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._1, KYCID._2],
      thematique: Thematique.alimentation,
    };
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      skipped_questions: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc as any,
    });
    await TestUtil.create(DB.kYC, {
      ...KYC_DB_DATA,
      id_cms: 1,
      code: KYCID._1,
      emoji: 'a',
      image_url: 'img_a',
      points: 123,
      short_question: 'short_a',
      unite: { abreviation: 'kg' },
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
      unite: { abreviation: 'euro' },
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
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID',
    ).send([
      { code: '_1', selected: true },
      { code: '_2', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    const kyc_ = user.kyc_history.getUpToDateMosaicById(
      KYCMosaicID.TEST_MOSAIC_ID,
    );

    expect(kyc_.is_skipped).toStrictEqual(false);
    expect(kyc_.is_answered).toStrictEqual(true);
  });

  it('POST /utilisateurs/id/questionsKYC_v2/1/skip - passe une mosaic deja répondu => passe pas', async () => {
    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      sous_titre: 'sous',
      tags: [Tag.possede_voiture],
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
      unite: { abreviation: 'kg' },
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      skipped_mosaics: [],
      skipped_questions: [],

      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          code: '_1',
          question: 'quest 1',
          sous_titre: 'sous',
          last_update: undefined,
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'oui', label: 'Oui', selected: true },
            { code: 'non', label: 'Non', selected: false },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              selected: false,
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          reponse_simple: undefined,
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
        {
          code: '_2',
          question: 'quest 2',
          sous_titre: 'sous',
          last_update: undefined,
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          a_supprimer: false,
          reponse_complexe: [
            { code: 'non', label: 'Non', selected: true },
            { code: 'oui', label: 'Oui', selected: false },
            {
              code: 'sais_pas',
              label: 'Je sais pas',
              ngc_code: undefined,
              selected: false,
            },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          reponse_simple: undefined,
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc as any });

    MosaicDefinition.TEST_MOSAIC_ID = MOSAIC_DEF;
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/TEST_MOSAIC_ID/skip',
    );

    // THEN
    expect(response.status).toBe(201);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    const kyc_ = user.kyc_history.getUpToDateMosaicById(
      KYCMosaicID.TEST_MOSAIC_ID,
    );

    expect(kyc_.is_skipped).toStrictEqual(false);
    expect(kyc_.is_answered).toStrictEqual(true);
  });
});
