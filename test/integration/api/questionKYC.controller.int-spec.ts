import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  BooleanKYC,
  TypeReponseQuestionKYC,
} from '../../../src/domain/kyc/questionKYC';
import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { KYC } from '.prisma/client';
import { Tag } from '../../../src/domain/scoring/tag';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import {
  MosaicKYC,
  MosaicKYCDef,
  TypeReponseMosaicKYC,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import { QuestionKYCUsecase } from '../../../src/usecase/questionKYC.usecase';

describe('/utilisateurs/id/questionsKYC (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const missions_with_kyc: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
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

  it('GET /utilisateurs/id/questionsKYC - 1 question répondue, avec attributs à jour depuis le catalogue', async () => {
    // GIVEN
    MosaicKYC.MOSAIC_CATALOGUE = [];
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: '1',
          id_cms: 11,
          question: `question`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          tags: [TagUtilisateur.appetence_bouger_sante],
          universes: [Univers.consommation],
          thematique: Thematique.consommation,
          ngc_key: '123',
          short_question: 'short',
          image_url: 'AAA',
        },
      ],
    };

    const dbKYC: KYC = {
      id_cms: 22,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Le climat !!!', code: Thematique.climat },
        { label: 'Mon logement !!!', code: Thematique.logement },
      ],
      short_question: 'short',
      image_url: 'AAA',
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.kYC, dbKYC);
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    const new_kyc = userDB.kyc_history.answered_questions[0];

    expect(new_kyc.question).toEqual('The question !');
    expect(new_kyc.points).toEqual(20);
    expect(new_kyc.is_NGC).toEqual(true);
    expect(new_kyc.id_cms).toEqual(22);
    expect(new_kyc.categorie).toEqual(Categorie.recommandation);
    expect(new_kyc.tags).toEqual([Tag.possede_voiture]);
    expect(new_kyc.universes).toEqual([Univers.alimentation]);
    expect(new_kyc.thematique).toEqual(Thematique.alimentation);
    expect(new_kyc.ngc_key).toEqual('a . b . c');
    expect(new_kyc.reponses).toEqual([
      { label: 'Le climat !!!', code: Thematique.climat },
    ]);
    expect(new_kyc.reponses_possibles).toEqual([
      { label: 'Le climat !!!', code: Thematique.climat },
      { label: 'Mon logement !!!', code: Thematique.logement },
    ]);
  });
  it('GET /utilisateurs/id/questionsKYC - liste N questions', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    MosaicKYC.MOSAIC_CATALOGUE = [];

    await TestUtil.create(DB.kYC, { id_cms: 1, code: KYCID.KYC001 });
    await TestUtil.create(DB.kYC, { id_cms: 2, code: KYCID.KYC002 });
    await TestUtil.create(DB.kYC, { id_cms: 3, code: KYCID._2 });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(3);
  });
  it('GET /utilisateurs/id/questionsKYC - liste N questions + 1 mosaic', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    MosaicKYC.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
      },
    ];

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
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
      created_at: undefined,
      updated_at: undefined,
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(5);
    expect(response.body[0]).toEqual({
      id: '_1',
      question: 'quest 1',
      reponse: [],
      reponses_possibles: ['Oui', 'Non', 'Je sais pas'],
      categorie: 'recommandation',
      points: 20,
      type: 'choix_unique',
      is_NGC: true,
      thematique: 'alimentation',
    });
    expect(response.body[4]).toEqual({
      id: 'TEST_MOSAIC_ID',
      titre: 'Titre test',
      reponses: [
        {
          code: '_1',
          image_url: 'AAA',
          label: 'short',
          boolean_value: false,
        },
        {
          code: '_2',
          image_url: 'URL',
          label: 'short',
          boolean_value: false,
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
      is_answered: false,
    });
  });

  it('GET /utilisateurs/id/questionsKYC - liste pas une mosaic de test en prod', async () => {
    // GIVEN
    process.env.IS_PROD = 'true';
    await TestUtil.create(DB.utilisateur);
    MosaicKYC.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
      },
    ];

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(0);
  });
  it('GET /utilisateurs/id/questionsKYC - liste une mosaic de test hors prod', async () => {
    // GIVEN
    process.env.IS_PROD = 'false';
    await TestUtil.create(DB.utilisateur);
    MosaicKYC.MOSAIC_CATALOGUE = [
      {
        id: KYCMosaicID.TEST_MOSAIC_ID,
        categorie: Categorie.test,
        points: 10,
        titre: 'Titre test',
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID._1, KYCID._2],
      },
    ];

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(1);
  });
  it('GET /utilisateurs/id/questionsKYC - liste N questions dont une remplie', async () => {
    // GIVEN
    MosaicKYC.MOSAIC_CATALOGUE = [];

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, { id_cms: 1, code: KYCID.KYC001 });
    await TestUtil.create(DB.kYC, { id_cms: 2, code: KYCID.KYC002 });
    await TestUtil.create(DB.kYC, { id_cms: 3, code: KYCID._2 });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(3);

    const quest = response.body.find((e) => e.id === '_2');
    expect(quest.reponse).toStrictEqual(['Le climat', 'Mon logement']);
  });

  it('GET /utilisateurs/id/questionsKYC/3 - renvoie la question sans réponse', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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
        { label: 'A voir', code: BooleanKYC.peut_etre },
      ],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/_3',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(Categorie.test);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
    expect(response.body.reponse).toEqual([]);
  });
  it(`GET /utilisateurs/id/questionsKYC/3 - renvoie les reponses possibles du catalogue, pas de la question historique `, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC001,
      reponses: [
        { label: 'AAA', code: Thematique.climat },
        { label: 'BBB', code: Thematique.logement },
      ],
    });

    await TestUtil.create(DB.utilisateur, {
      kyc: {
        version: 0,
        answered_questions: [
          {
            id: KYCID.KYC001,
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: Categorie.test,
            points: 10,
            reponses: [{ label: 'Le climat', code: Thematique.climat }],
            reponses_possibles: [
              { label: 'Le climat', code: Thematique.climat },
              { label: 'Mon logement', code: Thematique.logement },
              { label: 'Ce que je mange', code: Thematique.alimentation },
              { label: 'Comment je bouge', code: Thematique.transport },
            ],
            tags: [],
          },
        ],
      },
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.reponses_possibles).toEqual(['AAA', 'BBB']);
    expect(response.body.reponse).toEqual(['AAA']);
  });
  it('GET /utilisateurs/id/questionsKYC/bad - renvoie 404', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/id/questionsKYC/question - renvoie la quesition avec la réponse', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      kyc: {
        version: 0,
        answered_questions: [
          {
            id: KYCID._2,
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: Categorie.test,
            points: 10,
            reponses: [
              { label: 'Le climat', code: Thematique.climat },
              { label: 'Mon logement', code: Thematique.logement },
            ],
            reponses_possibles: [
              { label: 'Le climat', code: Thematique.climat },
              { label: 'Mon logement', code: Thematique.logement },
              { label: 'Ce que je mange', code: Thematique.alimentation },
            ],
            tags: [],
          },
        ],
      },
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.question).toEqual(
      `Quel est votre sujet principal d'intéret ?`,
    );
    expect(response.body.reponse).toEqual(['Le climat', 'Mon logement']);
  });

  it('PUT /utilisateurs/id/questionsKYC/1 - crée la reponse à la question 1, empoche les points', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    const catalogue = await kycRepository.getAllDefs();
    user.kyc_history.setCatalogue(catalogue);

    expect(
      user.kyc_history.getUpToDateQuestionByCodeOrException('_1').reponses,
    ).toStrictEqual([
      {
        code: null,
        label: 'YO',
        ngc_code: null,
      },
    ]);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(20);
    expect(
      userDB.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeLessThan(Date.now());
    expect(
      userDB.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });

  it(`PUT /utilisateurs/id/questionsKYC/1 - un defi deviens non recommandé suite à maj de KYC`, async () => {
    // GIVEN
    const missions_article_plus_defi: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          thematique_univers: ThematiqueUnivers.cereales,
          univers: Univers.alimentation,
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
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: '1',
          id_cms: 1,
          question: `question`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          categorie: Categorie.mission,
          points: 10,
          universes: [],
          thematique: Thematique.climat,
          reponses: [{ label: 'YI', code: 'yi' }],
          reponses_possibles: [
            { label: 'YI', code: 'yi' },
            { label: 'YO', code: 'yos' },
          ],
          tags: [],
          short_question: 'short',
          image_url: 'AAA',
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
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Faut manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Mange de la graine',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);

    let userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(false);
    // WHEN
    response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/1',
    ).send({ reponse: ['YI'] });

    // THEN
    expect(response.status).toBe(200);
    userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(true);
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_2',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const user = await utilisateurRepository.getById('utilisateur-id');
    const catalogue = await kycRepository.getAllDefs();
    user.kyc_history.setCatalogue(catalogue);
    expect(
      user.kyc_history.getUpToDateQuestionByCodeOrException('_2').reponses,
    ).toStrictEqual([
      {
        code: Thematique.climat,
        label: 'Le climat',
        ngc_code: undefined,
      },
    ]);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.gamification.points).toEqual(10);
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

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Comment je bouge'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.transport).toEqual(50);
  });
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

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/KYC001').send(
      {
        reponse: ['Comment je bouge'],
      },
    );

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC001',
    ).send({ reponse: ['Le climat'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.tag_ponderation_set.transport).toEqual(0);
  });

  it('PUT /utilisateurs/id/questionsKYC/006 - transpose dans logement KYC006 plus de 15 ans', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC006',
    ).send({ reponse: ['Plus de 15 ans (ancien)'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.plus_de_15_ans).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_DPE - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_DPE',
    ).send({ reponse: ['F'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.dpe).toEqual('F');
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_superficie - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_superficie',
    ).send({ reponse: ['134'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.superficie).toEqual(Superficie.superficie_150);
  });
  it('PUT /utilisateurs/id/questionsKYC/KYC_proprietaire - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_proprietaire',
    ).send({ reponse: ['Oui'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.proprietaire).toEqual(true);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_chauffage - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_chauffage',
    ).send({ reponse: ['Gaz'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.chauffage).toEqual(Chauffage.gaz);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_type_logement - transpose dans logement', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_type_logement',
    ).send({ reponse: ['Appartement'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.logement.type).toEqual(TypeLogement.appartement);
  });

  it('PUT /utilisateurs/id/questionsKYC/KYC_alimentation_regime - transpose dans mes KYC unitaires NGC', async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
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

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/KYC_alimentation_regime',
    ).send({ reponse: ['Peu de viande'] });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_vegetaliens,
      ).reponses[0].label,
    ).toEqual('1');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_vegetariens,
      ).reponses[0].label,
    ).toEqual('7');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_poisson_blanc,
      ).reponses[0].label,
    ).toEqual('1');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_poisson_gras,
      ).reponses[0].label,
    ).toEqual('1');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_viande_blanche,
      ).reponses[0].label,
    ).toEqual('4');
    expect(
      userDB.kyc_history.getAnsweredQuestionByCode(
        KYCID.KYC_nbr_plats_viande_rouge,
      ).reponses[0].label,
    ).toEqual('0');
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

  it('GET /utilisateurs/id/enchainementQuestionsKYC/id - liste un enchainement de quesitions', async () => {
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
        type: TypeReponseMosaicKYC.mosaic_boolean,
        question_kyc_codes: [KYCID.KYC002, KYCID.KYC003],
      },
    ];

    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
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
      created_at: undefined,
      updated_at: undefined,
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC/ENCHAINEMENT_KYC_1',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
    expect(response.body).toEqual([
      {
        id: 'KYC001',
        question: 'quest 1',
        reponse: [],
        reponses_possibles: ['Oui', 'Non', 'Je sais pas'],
        categorie: 'recommandation',
        points: 20,
        type: 'choix_unique',
        is_NGC: true,
        thematique: 'alimentation',
      },
      {
        id: 'TEST_MOSAIC_ID',
        titre: 'Titre test',
        reponses: [
          {
            boolean_value: false,
            code: 'KYC002',
            image_url: 'BBB',
            label: 'short 2',
          },
          {
            boolean_value: false,
            code: 'KYC003',
            image_url: 'CCC',
            label: 'short 3',
          },
        ],
        categorie: 'test',
        points: 10,
        type: 'mosaic_boolean',
        is_answered: false,
      },
    ]);
  });

  it('GET /utilisateurs/id/enchainementQuestionsKYC/id - enchainement qui existe pas', async () => {
    // GIVEN
    QuestionKYCUsecase.ENCHAINEMENTS = {
      ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    };

    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/enchainementQuestionsKYC/BAD',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "L'enchainement d'id [BAD] n'existe pas",
    );
  });
});
