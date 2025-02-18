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
import { CodeMission } from '../../../src/domain/mission/codeMission';
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
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { DefiRepository } from '../../../src/infrastructure/repository/defi.repository';

const KYC_DATA: QuestionKYC_v2 = {
  code: '1',
  last_update: undefined,
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
      selected: true,
    },
    {
      label: 'Mon logement',
      code: Thematique.logement,
      selected: false,
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

describe('/utilisateurs/id/questionsKYC (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const defiRepository = new DefiRepository(TestUtil.prisma);
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
        est_examen: false,
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

  it('GET /utilisateurs/id/questionsKYC/3 - renvoie la question sans réponse', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
    expect(response.body).toEqual({
      categorie: 'test',
      code: '_3',
      is_NGC: false,
      is_answered: false,
      points: 10,
      question:
        "Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?",
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
          code: 'peut_etre',
          label: 'A voir',
          selected: false,
        },
      ],
      thematique: 'climat',
      type: 'choix_unique',
    });
  });

  it('GET /utilisateurs/id/questionsKYC/3 - renvoie une question entière OK sans réponse', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.entier,
      question: `Combien de Km ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: undefined,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC_v2/_3',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      categorie: 'test',
      code: '_3',
      is_NGC: false,
      is_answered: false,
      points: 10,
      question: 'Combien de Km ?',
      reponse_unique: {
        unite: 'euro',
      },
      thematique: 'climat',
      type: 'entier',
    });
  });

  it('PUT /utilisateurs/id/questionsKYC/1 - crée la reponse à la question 1, empoche les points', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC006,
      type: TypeReponseQuestionKYC.choix_unique,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_1',
    ).send({ reponse: ['YO'] });

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
      userDB.missions.getRAWMissions()[0].objectifs[0].done_at.getTime(),
    ).toBeLessThan(Date.now());
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].done_at.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });

  it(`PUT /utilisateurs/id/questionsKYC/1 - un defi deviens non recommandé suite à maj de KYC`, async () => {
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
          est_examen: false,
        },
      ],
    };
    const kyc: KYCHistory_v2 = {
      version: 2,
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
            { label: 'YI', code: 'yi', selected: true },
            { label: 'YO', code: 'yos', selected: false },
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
      reponses: [
        { label: 'YI', code: 'yi' },
        { label: 'YO', code: 'yos' },
      ],
    });

    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ id_kyc: 1, code_kyc: '1', code_reponse: 'yi' }]],
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await kycRepository.loadDefinitions();
    await defiRepository.loadDefinitions();

    // WHEN
    let response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);

    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].est_reco).toEqual(
      false,
    );
    // WHEN
    response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YI'] });

    // THEN
    expect(response.status).toBe(200);
    userDB = await utilisateurRepository.getById('utilisateur-id', [Scope.ALL]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].est_reco).toEqual(
      true,
    );
  });

  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    ).send({ reponse: ['Le climat'] });

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
  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1, 2 options', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    ).send({ reponse: ['Le climat', 'Mon logement'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    expect(
      user.kyc_history
        .getUpToDateQuestionByCodeOrException('_2')
        .getSelectedLabels(),
    ).toStrictEqual(['Le climat', 'Mon logement']);
  });

  it('PUT /utilisateurs/id/questionsKYC/1 - met à jour la reponse à la question 1 type choix unique , deselect la réponse précédente', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          ...KYC_DATA,
          code: '1',
          id_cms: 1,
          type: TypeReponseQuestionKYC.choix_unique,
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
            {
              label: 'Ce que je mange',
              code: Thematique.alimentation,
              selected: false,
            },
          ],
          tags: [TagUtilisateur.appetence_bouger_sante],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: '1',
      question: `Quel est votre sujet principal d'intéret ?`,
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['Mon logement'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    user.kyc_history.setCatalogue(KycRepository.getCatalogue());
    expect(
      user.kyc_history
        .getUpToDateQuestionByCodeOrException('1')
        .getSelectedLabels(),
    ).toStrictEqual(['Mon logement']);
  });

  it('PUT /utilisateurs/id/questionsKYC/1 - erreur si réponse inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    ).send({ reponse: ['Le climat haha'] });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Reponse [Le climat haha] inconnue pour la KYC [_2]',
    );
  });

  it('PUT /utilisateurs/id/questionsKYC/001 - met à jour les tags de reco - ajout boost', async () => {
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Comment je bouge'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.tag_ponderation_set.transport).toEqual(50);
  });

  //########################################################################################################
  //########################################################################################################
  //########################################################################################################

  it('PUT /utilisateurs/id/questionsKYC/KYC001 - met à jour les tags de reco - suppression boost', async () => {
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

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/KYC001').send(
      {
        reponse: ['Comment je bouge'],
      },
    );
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.tag_ponderation_set.transport).toEqual(0);
  });

  it('PUT /utilisateurs/id/questionsKYC/006 - transpose dans logement KYC006 plus de 15 ans', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC006',
    ).send({ reponse: ['Plus de 15 ans (ancien)'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC/006 - transpose dans logement KYC_logement_age plus de 15 ans', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_logement_age',
    ).send({ reponse: ['30'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_DPE - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_DPE',
    ).send({ reponse: ['F'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.dpe).toEqual('F');
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_superficie - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_superficie',
    ).send({ reponse: ['134'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.superficie).toEqual(Superficie.superficie_150);
  });
  it('PUT /utilisateurs/id/questionsKYC/KYC_proprietaire - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_proprietaire',
    ).send({ reponse: ['Oui'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.proprietaire).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_chauffage - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_chauffage',
    ).send({ reponse: ['Gaz'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.chauffage).toEqual(Chauffage.gaz);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_type_logement - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_type_logement',
    ).send({ reponse: ['Appartement'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.logement.type).toEqual(TypeLogement.appartement);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_alimentation_regime - transpose dans mes KYC unitaires NGC', async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
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
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_alimentation_regime',
    ).send({ reponse: ['Peu de viande'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_vegetaliens)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_vegetariens)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(7);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_poisson_blanc)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_poisson_gras)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(1);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_viande_blanche)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(4);
    expect(
      userDB.kyc_history
        .getUpToDateAnsweredQuestionByCode(KYCID.KYC_nbr_plats_viande_rouge)
        .getReponseSimpleValueAsNumber(),
    ).toEqual(0);
  });

  it('PUT /utilisateurs/id/questionsKYC/bad - erreur 404 ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    ).send({ reponse: ['YO'] });

    // THEN

    expect(response.status).toBe(404);
  });
});
