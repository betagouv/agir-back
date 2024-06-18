import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Univers } from '../../../src/domain/univers/univers';
import {
  TypeReponseQuestionKYC,
  BooleanKYC,
} from '../../../src/domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { EventType } from '../../../src/domain/appEvent';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { CelebrationType } from '../../../src/domain/gamification/celebrations/celebration';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { DefiHistory_v0 } from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Thematique } from '../../../src/domain/contenu/thematique';

describe('Mission (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const missions: MissionsUtilisateur_v0 = {
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
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '1',
            content_id: '13',
            type: ContentType.article,
            titre: 'Super article {COMMUNE}',
            points: 10,
            is_locked: true,
            done_at: new Date(0),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '2',
            content_id: '14',
            type: ContentType.quizz,
            titre: 'Super quizz',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '2',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: true,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };
  const missions_kyc_done: MissionsUtilisateur_v0 = {
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
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };
  const missions_kyc_plus_article: MissionsUtilisateur_v0 = {
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
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
            points: 10,
            is_locked: true,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };
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
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '1',
            content_id: '1',
            type: ContentType.defi,
            titre: '1 défi',
            points: 10,
            is_locked: true,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };
  const missions_quizz_plus_defi: MissionsUtilisateur_v0 = {
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
            type: ContentType.quizz,
            titre: '1 quizz',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '1',
            content_id: '2',
            type: ContentType.defi,
            titre: '1 défi',
            points: 10,
            is_locked: true,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };
  const missions_article_seul: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        objectifs: [
          {
            id: '000',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
            points: 10,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [],
        est_visible: true,
      },
    ],
  };
  const missions_2_KYC: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        objectifs: [
          {
            id: '000',
            content_id: '_1',
            type: ContentType.kyc,
            titre: '1 kyc',
            points: 10,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '111',
            content_id: '_2',
            type: ContentType.kyc,
            titre: '1 kyc',
            points: 20,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [],
        est_visible: true,
      },
    ],
  };

  const missions_defi_seul: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        objectifs: [
          {
            id: '0',
            content_id: '0',
            type: ContentType.defi,
            titre: '1 defi',
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
            titre: '1 defi',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
    ],
  };

  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

  it(`GET /utilisateurs/id/thematiques/climat/mission - renvoie la mission de la thématique - à partir du compte utilisateur`, async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '2',
          points: 10,
          tags: [],
          titre: 'titre',
          thematique: Thematique.transport,
          astuces: 'ASTUCE',
          date_acceptation: null,
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.en_cours,
          universes: [Univers.climat],
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { missions: missions, defis: defis });
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
    await TestUtil.create(DB.defi, { content_id: '2' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(false);
    expect(response.body.image_url).toEqual('aaaa');
    expect(response.body.progression).toEqual({ current: 1, target: 4 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
    expect(response.body.univers_label).toEqual('Faut manger !');
    expect(response.body.done_at).toEqual(new Date(1).toISOString());
    expect(response.body.objectifs).toHaveLength(4);
    expect(response.body.progression_kyc).toEqual({ current: 0, target: 1 });

    const objectif = response.body.objectifs[1];
    expect(objectif.id).toEqual('1');
    expect(objectif.content_id).toEqual('13');
    expect(objectif.type).toEqual(ContentType.article);
    expect(objectif.titre).toEqual('Super article Palaiseau');
    expect(objectif.points).toEqual(10);
    expect(objectif.is_locked).toEqual(true);
    expect(objectif.done_at).toEqual(new Date(0).toISOString());

    const objectif_defi = response.body.objectifs[3];
    expect(objectif_defi.defi_status).toEqual(DefiStatus.en_cours);
  });

  it(`GET /utilisateurs/id/thematiques/climat/mission - renvoie la mission de la thématique - à partir du catalgue de mission`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
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

    await TestUtil.create(DB.mission);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.mission,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 2 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
    expect(response.body.univers_label).toEqual('Faut manger !');
    expect(response.body.done_at).toEqual(null);
    expect(response.body.objectifs).toHaveLength(2);

    const objctif_kyc = response.body.objectifs[0];
    expect(objctif_kyc.is_locked).toEqual(false);

    const objectif_article = response.body.objectifs[1];
    expect(objectif_article.id.length).toBeGreaterThan(10);
    expect(objectif_article.content_id).toEqual('1');
    expect(objectif_article.type).toEqual(ContentType.article);
    expect(objectif_article.titre).toEqual('obj 2');
    expect(objectif_article.points).toEqual(25);
    expect(objectif_article.is_locked).toEqual(true);
    expect(objectif_article.done_at).toEqual(null);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions).toHaveLength(1);
  });
  it(`GET /utilisateurs/id/thematiques/climat/mission - 404 si pas de mission pour cette thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_article_seul });
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/000/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour deux KYC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });
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
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.test,
      points: 0,
      question: `HAHA`,
      reponses: [],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.test,
      points: 0,
      question: `HIHI`,
      reponses: [],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/111/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(
      userDB.missions.missions[0].objectifs[1].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(40);
  });
  it(`GET /utilisateurs/id/thematiques/cereales/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /utilisateurs/id/thematiques/cereales/next_kyc - renvoie la prochaine question à poser`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: BooleanKYC.peut_etre },
      ],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/next_kyc',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(Categorie.test);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
  });
  it(`GET /utilisateurs/id/thematiques/cereales/next_kyc - renvoie la liste des questions à poser`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: BooleanKYC.peut_etre },
      ],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/kycs',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      id: '_3',
      question:
        "Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?",
      reponse: [],
      categorie: 'test',
      points: 10,
      type: 'choix_unique',
      reponses_possibles: ['Oui', 'Non', 'A voir'],
      is_NGC: false,
      thematique: 'climat',
    });
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un article débloqué suite à la réalisation de la KYC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_kyc_plus_article,
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: BooleanKYC.peut_etre },
      ],
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_3',
    ).send({ reponse: ['YO'] });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué lecture du dernier article`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '1' });
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
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(true);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );
    // THEN
    expect(response.body.objectifs).toHaveLength(2);
    const objctif_defi = response.body.objectifs[1];
    expect(objctif_defi.is_reco).toEqual(true);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué lecture du dernier article, mais non visible car condition par remplie`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ code_kyc: '1', code_reponse: 'yi' }]],
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
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(false);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );
    // THEN
    expect(response.body.objectifs).toHaveLength(2);
    const objctif_defi = response.body.objectifs[1];
    expect(objctif_defi.is_reco).toEqual(false);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué lecture du dernier article,  visible car condition remplie`, async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_questions: [
        {
          id: '1',
          id_cms: 1,
          question: `Question`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'YO', code: 'yo' },
            { label: 'YI', code: 'yi' },
          ],
          reponses_possibles: [
            { label: 'YO', code: 'yo' },
            { label: 'YI', code: 'yi' },
            { label: 'YA', code: 'ya' },
          ],
          tags: [],
          universes: [],
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
      kyc: kyc,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ id_kyc: '1', code_kyc: '1', code_reponse: 'yi' }]],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(true);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué suite dernier quizz`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_quizz_plus_defi,
    });
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '2' });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '1',
      number_value: 100,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('2');
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(false);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué suite dernier quizz, même si raté, et points déjà en poche`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_quizz_plus_defi,
    });
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '2' });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '1',
      number_value: 0,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('2');
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - ajout mission si dernier defi réalisé`, async () => {
    // GIVEN
    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [],
    };
    await TestUtil.create(DB.utilisateur, {
      missions: missions_defi_seul,
      gamification: gamification,
    });
    await TestUtil.create(DB.defi, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: false,
      thematique_univers: ThematiqueUnivers.dechets_compost,
    });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.fait,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.missions.missions).toHaveLength(2);

    const old_mission = userDB.missions.getMissionById('1');
    const new_mission = userDB.missions.getMissionById('2');

    expect(old_mission.isDone()).toEqual(true);
    expect(old_mission.done_at.getTime()).toBeGreaterThan(Date.now() - 100);

    expect(new_mission.est_visible).toEqual(true);
    expect(new_mission.thematique_univers).toEqual(
      ThematiqueUnivers.dechets_compost,
    );
    expect(userDB.gamification.celebrations).toHaveLength(1);
    expect(userDB.gamification.celebrations[0].new_thematiques).toEqual([
      ThematiqueUnivers.dechets_compost,
    ]);
    expect(userDB.gamification.celebrations[0].type).toEqual(
      CelebrationType.fin_thematique,
    );
    expect(userDB.gamification.celebrations[0].thematique_univers).toEqual(
      ThematiqueUnivers.cereales,
    );
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - NON ajout mission si dernier defi abondonné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_defi_seul,
    });
    await TestUtil.create(DB.defi, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: false,
      thematique_univers: ThematiqueUnivers.dechets_compost,
    });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.abondon,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');

    expect(userDB.missions.missions).toHaveLength(1);

    const old_mission = userDB.missions.getMissionById('1');

    expect(old_mission.isDone()).toEqual(false);
    expect(old_mission.done_at).toEqual(null);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - is_new true si rien fait`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });

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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 2 });
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
});
