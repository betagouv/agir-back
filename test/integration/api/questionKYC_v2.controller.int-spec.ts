import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  BooleanKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { CodeMission } from '../../../src/domain/thematique/codeMission';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { KYC } from '.prisma/client';
import { Tag } from '../../../src/domain/scoring/tag';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import {
  MosaicKYC_CATALOGUE,
  MosaicKYCDef,
  TypeMosaic,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';
import {
  KYCHistory_v1,
  QuestionKYC_v1,
} from '../../../src/domain/object_store/kyc/kycHistory_v1';

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
  tags: [TagUtilisateur.appetence_bouger_sante],
  thematique: Thematique.consommation,
  ngc_key: '123',
  short_question: 'short',
  image_url: 'AAA',
  conditions: [],
  unite: Unite.kg,
  emoji: '🔥',
};

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
  tags: ['A'],
  thematique: Thematique.dechet,
  unite: Unite.kg,
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

describe('/utilisateurs/id/questionsKYC_v2 (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const missions_with_kyc: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
        objectifs: [
          {
            id: '0',
            content_id: '_1',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: true,
      },
    ],
  };

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

  it('GET /utilisateurs/id/questionsKYC_v2 - 1 question répondue, avec attributs à jour depuis le catalogue', async () => {
    // GIVEN
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [];
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 11,
          type: TypeReponseQuestionKYC.choix_unique,
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
          tags: [TagUtilisateur.appetence_bouger_sante],
        },
      ],
    };

    const dbKYC: KYC = {
      id_cms: 22,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Le climat !!!', code: Thematique.climat },
        { label: 'Mon logement !!!', code: Thematique.logement },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      created_at: undefined,
      updated_at: undefined,
      unite: Unite.kg,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, dbKYC);
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const new_kyc = userDB.kyc_history.answered_questions[0];

    expect(new_kyc.question).toEqual('The question !');
    expect(new_kyc.points).toEqual(20);
    expect(new_kyc.is_NGC).toEqual(true);
    expect(new_kyc.id_cms).toEqual(22);
    expect(new_kyc.categorie).toEqual(Categorie.recommandation);
    expect(new_kyc.tags).toEqual([Tag.possede_voiture]);
    expect(new_kyc.thematique).toEqual(Thematique.alimentation);
    expect(new_kyc.ngc_key).toEqual('a . b . c');
    expect(new_kyc.getReponseComplexeByCode(Thematique.climat)).toEqual({
      code: 'climat',
      emoji: undefined,
      image_url: undefined,
      label: 'Le climat !!!',
      ngc_code: undefined,
      unite: undefined,
      value: 'oui',
    });
  });
  it('GET /utilisateurs/id/questionsKYC_v2 - liste N questions', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [];

    await TestUtil.create(DB.kYC, { id_cms: 1, code: KYCID.KYC001 });
    await TestUtil.create(DB.kYC, { id_cms: 2, code: KYCID.KYC002 });
    await TestUtil.create(DB.kYC, { id_cms: 3, code: KYCID._2 });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_V2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(3);
  });
  it('GET /utilisateurs/id/questionsKYC_V2 - liste N questions + 1 mosaic', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
        thematique: Thematique.alimentation,
      },
    ];

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
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
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 4,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 5,
      question: 'quest 2',
      code: '_2',
    });
    await TestUtil.create(DB.kYC, { id_cms: 1, code: KYCID.KYC001 });
    await TestUtil.create(DB.kYC, { id_cms: 2, code: KYCID.KYC002 });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(5);
    expect(response.body[0]).toEqual({
      code: '_1',
      is_answered: false,
      question: 'quest 1',
      reponse_multiple: [
        {
          code: 'oui',
          label: 'Oui',
          selected: false,
        },
        {
          code: 'non',
          label: 'Non',
          selected: false,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          selected: false,
        },
      ],
      categorie: 'recommandation',
      points: 20,
      type: 'choix_unique',
      is_NGC: true,
      thematique: 'alimentation',
    });
    expect(response.body[4]).toEqual({
      code: 'TEST_MOSAIC_ID',
      is_NGC: false,
      question: 'Titre test',
      reponse_multiple: [
        {
          code: '_1',
          image_url: 'AAA',
          label: 'short',
          selected: false,
          emoji: '🔥',
          unite: Unite.kg,
        },
        {
          code: '_2',
          image_url: 'AAA',
          label: 'short',
          selected: false,
          emoji: '🔥',
          unite: Unite.kg,
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_answered: false,
      thematique: 'alimentation',
    });
  });

  it('GET /utilisateurs/id/questionsKYC_v2 - liste une mosaic de test hors prod', async () => {
    // GIVEN
    process.env.IS_PROD = 'false';
    await TestUtil.create(DB.utilisateur);
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
        thematique: Thematique.alimentation,
      },
    ];
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(1);
  });
  it('GET /utilisateurs/id/questionsKY_v2 - liste N questions dont une remplie', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          code: KYCID._2,
          id_cms: 2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              value: 'oui',
              ngc_code: '123',
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              value: 'oui',
              ngc_code: '123',
            },
          ],
          tags: [],
          short_question: 'short',
          image_url: 'URL',
          conditions: [],
          unite: Unite.euro,
          emoji: '🎉',
          ngc_key: '1223',
          thematique: Thematique.climat,
          reponse_simple: undefined,
        },
      ],
    };
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = [];

    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await TestUtil.create(DB.kYC, { id_cms: 1, code: KYCID.KYC001 });
    await TestUtil.create(DB.kYC, { id_cms: 2, code: KYCID.KYC002 });
    const KYC_DB_DATA_: KYC = {
      id_cms: 3,
      code: KYCID._2,
      a_supprimer: false,
      categorie: Categorie.mission,
      conditions: undefined,
      emoji: 'a',
      image_url: 'img',
      is_ngc: true,
      ngc_key: 'a . b . c',
      points: 123,
      short_question: 'short',
      tags: ['A'],
      thematique: Thematique.dechet,
      unite: Unite.kg,
      type: TypeReponseQuestionKYC.choix_multiple,
      question: `Quel est votre sujet principal d'intéret ?`,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.kYC, KYC_DB_DATA_);

    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(3);

    const quest = response.body.find((e) => e.code === '_2');
    expect(quest.reponse_multiple).toStrictEqual([
      {
        code: 'climat',
        label: 'Le climat',
        selected: true,
      },
      {
        code: 'logement',
        label: 'Mon logement',
        selected: true,
      },
      {
        code: 'alimentation',
        label: 'Ce que je mange',
        selected: false,
      },
    ]);
  });

  it('GET /utilisateurs/id/questionsKYC_v2/3 - renvoie la question sans réponse', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: 'peut_etre' },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_3',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.code).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponse_multiple).toEqual([
      {
        code: 'oui',
        label: 'Oui',
        selected: false,
      },
      {
        code: 'non',
        label: 'Non',
        selected: false,
      },
      {
        code: 'peut_etre',
        label: 'A voir',
        selected: false,
      },
    ]);
    expect(response.body.categorie).toEqual(Categorie.test);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
  });
  it(`GET /utilisateurs/id/questionsKYC_v2/3 - renvoie les reponses possibles du catalogue, pas de la question historique `, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC001,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
      ],
    });

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID.KYC001,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            { label: 'Le climat', code: Thematique.climat, value: 'oui' },
            { label: 'Mon logement', code: Thematique.logement, value: 'non' },
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              value: 'non',
            },
            {
              label: 'Comment je bouge',
              code: Thematique.transport,
              value: 'non',
            },
          ],
          tags: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC001',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.reponse_multiple).toEqual([
      {
        code: 'climat',
        label: 'AAA',
        selected: true,
      },
      {
        code: 'logement',
        label: 'BBB',
        selected: false,
      },
    ]);
  });
  it('GET /utilisateurs/id/questionsKYC_v2/bad - renvoie 404', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/id/questionsKYC_v2/question - renvoie la quesition avec la réponse', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          id_cms: 1,
          code: KYCID._2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            { label: 'Le climat', code: Thematique.climat, value: 'oui' },
            { label: 'Mon logement', code: Thematique.logement, value: 'oui' },
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              value: 'non',
            },
          ],
          tags: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      question: `Quel est votre sujet principal d'intéret ?`,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual(
      `Quel est votre sujet principal d'intéret ?`,
    );
    expect(response.body.reponse_multiple).toEqual([
      {
        code: 'climat',
        label: 'Le climat',
        selected: true,
      },
      {
        code: 'logement',
        label: 'Mon logement',
        selected: true,
      },
      {
        code: 'alimentation',
        label: 'Ce que je mange',
        selected: false,
      },
    ]);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC001 - met à jour les tags de reco - suppression boost', async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC001,
      question: `Quel est votre sujet principal d'intéret ?`,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
        { label: 'Comment je bouge', code: Thematique.transport },
      ],
    });

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await kycRepository.loadDefinitions();

    await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC001',
    ).send([
      { code: Thematique.transport, selected: true },
      { code: Thematique.alimentation, selected: false },
      { code: Thematique.climat, selected: false },
      { code: Thematique.logement, selected: false },
    ]);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC001',
    ).send([
      { code: Thematique.transport, selected: false },
      { code: Thematique.alimentation, selected: false },
      { code: Thematique.climat, selected: true },
      { code: Thematique.logement, selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.tag_ponderation_set.transport).toEqual(0);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/006 - transpose dans logement KYC006 plus de 15 ans', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '91120',
        chauffage: Chauffage.bois,
        commune: 'PALAISEAU',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: false,
        proprietaire: true,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC006,
      question: `YOP`,
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC006',
    ).send([
      { code: 'plus_15', selected: true },
      { code: 'moins_15', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/006 - transpose dans logement KYC_logement_age plus de 15 ans', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '91120',
        chauffage: Chauffage.bois,
        commune: 'PALAISEAU',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: false,
        proprietaire: true,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      is_ngc: true,
      code: KYCID.KYC_logement_age,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      ngc_key: 'a . b .c',
      points: 10,
      question: 'Age maison',
      reponses: [],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_logement_age',
    ).send([{ value: '30' }]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_DPE - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: {
        version: 0,
        dpe: DPE.B,
      },
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_DPE,
      question: `YOP`,
      reponses: [
        { code: 'A', label: 'A', ngc_code: null },
        { code: 'B', label: 'B', ngc_code: null },
        { code: 'C', label: 'C', ngc_code: null },
        { code: 'D', label: 'D', ngc_code: null },
        { code: 'E', label: 'E', ngc_code: null },
        { code: 'F', label: 'F', ngc_code: null },
        { code: 'G', label: 'G', ngc_code: null },
        { code: 'ne_sais_pas', label: 'Je ne sais pas', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_DPE',
    ).send([
      { code: 'F', selected: true },

      { code: 'A', selected: false },
      { code: 'B', selected: false },
      { code: 'C', selected: false },
      { code: 'D', selected: false },
      { code: 'E', selected: false },
      { code: 'G', selected: false },
      { code: 'ne_sais_pas', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.dpe).toEqual('F');
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_superficie - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: logement,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_superficie,
      question: `YOP`,
      reponses: [],
      type: TypeReponseQuestionKYC.entier,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_superficie',
    ).send([{ value: '134' }]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.superficie).toEqual(Superficie.superficie_150);
  });
  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_proprietaire - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: false,
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: logement,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_proprietaire,
      question: `YOP`,
      reponses: [
        { code: 'oui', label: 'Oui', ngc_code: null },
        { code: 'non', label: 'Non', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_proprietaire',
    ).send([
      { code: 'oui', selected: true },
      { code: 'non', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.proprietaire).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_chauffage - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],

      answered_questions: [],
    };
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: false,
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: logement,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_chauffage,
      question: `YOP`,
      reponses: [
        {
          code: 'electricite',
          label: 'Électricité',
          ngc_code: '"électricité . présent"',
        },
        { code: 'bois', label: 'Bois / Pellets', ngc_code: '"bois . présent"' },
        { code: 'fioul', label: 'Fioul', ngc_code: '"fioul . présent"' },
        { code: 'gaz', label: 'Gaz', ngc_code: '"gaz . présent"' },
        {
          code: 'ne_sais_pas',
          label: 'Autre ou je ne sais pas',
          ngc_code: null,
        },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_chauffage',
    ).send([
      { code: 'gaz', selected: true },
      {
        code: 'electricite',
        selected: false,
      },
      { code: 'bois', selected: false },
      { code: 'fioul', selected: false },
      {
        code: 'ne_sais_pas',
        selected: false,
      },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.chauffage).toEqual(Chauffage.gaz);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_type_logement - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: false,
    };

    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
      logement: logement,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_type_logement,
      question: `YOP`,
      reponses: [
        { code: 'type_maison', label: 'Maison', ngc_code: null },
        { code: 'type_appartement', label: 'Appartement', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_type_logement',
    ).send([
      { code: 'type_appartement', selected: true },
      { code: 'type_maison', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.type).toEqual(TypeLogement.appartement);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/KYC_alimentation_regime - transpose dans mes KYC unitaires NGC', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_alimentation_regime,
      question: `YOP`,
      reponses: [
        { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
        { code: 'vegetarien', label: 'Vegetarien', ngc_code: null },
        { code: 'peu_viande', label: 'Peu de viande', ngc_code: null },
        { code: 'chaque_jour_viande', label: 'Tous les jours', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC_nbr_plats_vegetaliens,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 3,
      code: KYCID.KYC_nbr_plats_vegetariens,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 4,
      code: KYCID.KYC_nbr_plats_poisson_blanc,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 5,
      code: KYCID.KYC_nbr_plats_poisson_gras,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 6,
      code: KYCID.KYC_nbr_plats_viande_blanche,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 7,
      code: KYCID.KYC_nbr_plats_viande_rouge,
      question: `YOP`,
      type: TypeReponseQuestionKYC.entier,
    });

    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC_alimentation_regime',
    ).send([
      { code: 'vegetalien', selected: false },
      { code: 'vegetarien', selected: false },
      { code: 'peu_viande', selected: true },
      { code: 'chaque_jour_viande', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_vegetaliens)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_vegetariens)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(7);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_poisson_blanc)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_poisson_gras)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_viande_blanche)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(4);
    expect(
      userDB.kyc_history
        .getAnsweredQuestionByCode(KYCID.KYC_nbr_plats_viande_rouge)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(0);
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - liste un enchainement de quesitions', async () => {
    // GIVEN
    QuestionKYCUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    };

    const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeMosaic.mosaic_boolean,
        question_kyc_codes: [KYCID.KYC002, KYCID.KYC003],
        thematique: Thematique.alimentation,
      },
    ];

    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
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
      unite: Unite.kg,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      short_question: 'short 1',
      image_url: 'AAA',
      code: KYCID.KYC001,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      short_question: 'short 2',
      image_url: 'BBB',
      code: KYCID.KYC002,
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 3,
      question: 'quest 3',
      short_question: 'short 3',
      image_url: 'CCC',
      code: KYCID.KYC003,
    });

    await TestUtil.create(DB.utilisateur);
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/ENCHAINEMENT_KYC_1',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
    expect(response.body).toEqual([
      {
        code: 'KYC001',
        question: 'quest 1',
        is_answered: false,
        reponse_multiple: [
          {
            code: 'oui',
            label: 'Oui',
            selected: false,
          },
          {
            code: 'non',
            label: 'Non',
            selected: false,
          },
          {
            code: 'sais_pas',
            label: 'Je sais pas',
            selected: false,
          },
        ],
        categorie: 'recommandation',
        points: 20,
        type: 'choix_unique',
        is_NGC: true,
        thematique: 'alimentation',
      },
      {
        code: 'TEST_MOSAIC_ID',
        question: 'Titre test',
        is_NGC: false,
        reponse_multiple: [
          {
            code: 'KYC002',
            image_url: 'BBB',
            label: 'short 2',
            emoji: '🔥',
            unite: 'kg',
            selected: false,
          },
          {
            code: 'KYC003',
            image_url: 'CCC',
            label: 'short 3',
            emoji: '🔥',
            unite: 'kg',
            selected: false,
          },
        ],
        categorie: 'test',
        points: 10,
        type: 'mosaic_boolean',
        is_answered: false,
        thematique: 'alimentation',
      },
    ]);
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC_v2/id - enchainement qui existe pas', async () => {
    // GIVEN
    QuestionKYCUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    };

    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC_v2/BAD',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "L'enchainement d'id [BAD] n'existe pas",
    );
  });

  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie la quesition avec la réponse depuis l'historique , maj avec la definition`, async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: KYCID._2,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ????`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            { label: 'Le climat', code: Thematique.climat, value: 'oui' },
            { label: 'Mon logement', code: Thematique.logement, value: 'non' },
          ],
          reponse_simple: undefined,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      question: `Quel est votre sujet principal d'intéret ?`,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: '_2',
      question: "Quel est votre sujet principal d'intéret ?",
      reponse_multiple: [
        { code: 'climat', label: 'Le climat', selected: true },
        { code: 'logement', label: 'Mon logement', selected: false },
        { code: 'alimentation', label: 'Ce que je mange', selected: false },
      ],
      categorie: 'recommandation',
      points: 10,
      type: 'choix_multiple',
      is_NGC: false,
      thematique: 'climat',
      is_answered: true,
    });
  });
  it(`GET /utilisateurs/id/questionsKYC-V2/question - renvoie la question multiple depuis catalogue seul`, async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, KYC_DB_DATA);
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: '_2',
      question: "Quel est votre sujet principal d'intéret ?",
      reponse_multiple: [
        { code: 'climat', label: 'Le climat', selected: false },
        { code: 'logement', label: 'Mon logement', selected: false },
        { code: 'alimentation', label: 'Ce que je mange', selected: false },
      ],
      categorie: 'mission',
      points: 123,
      type: 'choix_multiple',
      is_NGC: true,
      thematique: 'dechet',
      is_answered: false,
    });
  });
  it(`GET /utilisateurs/id/questionsKYC_V2/question - renvoie la question unique depuis catalogue seul`, async () => {
    // GIVEN
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
      type: TypeReponseQuestionKYC.entier,
      reponses: undefined,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: '_2',
      question: "Quel est votre sujet principal d'intéret ?",
      reponse_unique: { unite: 'kg' },
      categorie: 'mission',
      points: 123,
      type: 'entier',
      is_NGC: true,
      thematique: 'dechet',
      is_answered: false,
    });
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/1 - crée la reponse à la question 1, empoche les points', async () => {
    // GIVEN
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      missions: missions_with_kyc,
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_1',
    ).send([{ value: 'YO' }]);

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    user.kyc_history.setCatalogue(KycRepository.getCatalogue());

    expect(
      user.kyc_history
        .getUpToDateQuestionByCodeOrException('_1')
        .getReponseSimpleValue(),
    ).toStrictEqual('YO');

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.gamification.points).toEqual(20);
    expect(
      userDB.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeLessThan(Date.now());
    expect(
      userDB.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });

  it(`PUT /utilisateurs/id/questionsKYC_v2/1 - un defi deviens non recommandé suite à maj de KYC`, async () => {
    // GIVEN
    const missions_article_plus_defi: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          code: CodeMission.cereales,
          image_url: 'img',
          thematique: Thematique.alimentation,
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          objectifs: [
            {
              id: '0',
              content_id: '1',
              type: ContentType.article,
              titre: '1 article',
              points: 10,
              is_locked: false,
              done_at: new Date(),
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '1',
              content_id: '1',
              type: ContentType.defi,
              titre: '1 défi',
              points: 10,
              is_locked: false,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
          ],
          est_visible: true,
        },
      ],
    };
    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 1,
          question: `question`,
          type: TypeReponseQuestionKYC.choix_unique,
          thematique: Thematique.climat,
          reponse_complexe: [
            { label: 'YI', code: 'yi', value: 'oui' },
            { label: 'YO', code: 'yos', value: 'non' },
          ],
          tags: [],
          short_question: 'short',
          image_url: 'AAA',
          conditions: [],
          unite: Unite.kg,
          emoji: '🔥',
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
      kyc: kyc,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: '1',
      question: `question`,
      type: TypeReponseQuestionKYC.choix_unique,
      reponses: [
        { label: 'YI', code: 'yi' },
        { label: 'YO', code: 'yos' },
      ],
    });

    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ id_kyc: 1, code_reponse: 'yi' }]],
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await kycRepository.loadDefinitions();

    // WHEN
    let response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/1',
    ).send([
      { code: 'yos', selected: true },
      { code: 'yi', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);

    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(false);
    // WHEN
    response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/1',
    ).send([
      { code: 'yi', selected: true },
      { code: 'yos', selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    userDB = await utilisateurRepository.getById('utilisateur-id', [Scope.ALL]);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_multiple,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    ).send([
      { code: Thematique.climat, selected: true },
      { code: Thematique.logement, selected: false },
      { code: Thematique.alimentation, selected: false },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    expect(
      user.kyc_history
        .getUpToDateQuestionByCodeOrException('_2')
        .getCodeReponseQuestionChoixUnique(),
    ).toStrictEqual(Thematique.climat);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.gamification.points).toEqual(10);
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/1 - erreur si code réponse inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      question: `Quel est votre sujet principal d'intéret ?`,
      type: TypeReponseQuestionKYC.choix_multiple,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_2',
    ).send([
      { code: 'hahah', selected: true },
      { code: Thematique.logement, selected: false },
      { code: Thematique.alimentation, selected: false },
    ]);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Valeur manquante pour le code [climat] de la question [_2]',
    );
  });

  it('PUT /utilisateurs/id/questionsKYC_v2/001 - met à jour les tags de reco - ajout boost', async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC001,
      question: `Quel est votre sujet principal d'intéret ?`,
      type: TypeReponseQuestionKYC.choix_multiple,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
        { label: 'Comment je bouge', code: Thematique.transport },
      ],
    });
    await kycRepository.loadDefinitions();

    const kyc: KYCHistory_v1 = {
      version: 1,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/KYC001',
    ).send([
      { code: Thematique.climat, selected: false },
      { code: Thematique.logement, selected: false },
      { code: Thematique.alimentation, selected: false },
      { code: Thematique.transport, selected: true },
    ]);

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.tag_ponderation_set.transport).toEqual(50);
  });
});
