import { DB, TestUtil } from '../../TestUtil';
import { CodeMission } from '../../../src/domain/thematique/codeMission';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import {
  TypeReponseQuestionKYC,
  BooleanKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { EventType } from '../../../src/domain/appEvent';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { DefiHistory_v0 } from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ObjectifDefinition } from '../../../src/domain/mission/missionDefinition';
import { Mission } from '@prisma/client';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import {
  MosaicKYC_CATALOGUE,
  MosaicKYCDef,
  TypeMosaic,
} from '../../../src/domain/kyc/mosaicKYC';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { MissionRepository } from '../../../src/infrastructure/repository/mission.repository';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';
import { KYCHistory_v2 } from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { DefiRepository } from '../../../src/infrastructure/repository/defi.repository';

describe('Mission (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);
  const defiRepository = new DefiRepository(TestUtil.prisma);

  const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre test',
      type: TypeMosaic.mosaic_boolean,
      question_kyc_codes: [KYCID._2, KYCID._3],
      thematique: Thematique.alimentation,
    },
  ];
  const objectifs: ObjectifDefinition[] = [
    {
      content_id: '11',
      points: 5,
      titre: 'yop',
      type: ContentType.kyc,
      tag_article: null,
      id_cms: 11,
    },
    {
      content_id: '222',
      points: 5,
      titre: 'haha',
      type: ContentType.article,
      tag_article: null,
      id_cms: 222,
    },
    {
      content_id: null,
      points: 5,
      titre: 'TTT',
      type: ContentType.article,
      tag_article: 'composter',
      id_cms: null,
    },
  ];

  const mission_articles_tag: Mission = {
    id_cms: 1,
    est_visible: true,
    est_examen: false,
    objectifs: objectifs as any,
    code: CodeMission.cereales,
    image_url: 'img',
    thematique: Thematique.alimentation,
    titre: 'titre',
    introduction: 'intro',
    is_first: false,
    created_at: undefined,
    updated_at: undefined,
  };

  const missions: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const mission_avec_mosaic: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
          {
            id: '1',
            content_id: KYCMosaicID.TEST_MOSAIC_ID,
            type: ContentType.mosaic,
            titre: 'Mosaic pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '2',
            content_id: '_3',
            type: ContentType.kyc,
            titre: 'Dernière question',
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
  const missions_kyc_done: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_kyc_plus_article: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_article_plus_defi: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_quizz_plus_defi: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_article_seul: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_2_KYC: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };

  const missions_defi_seul: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
        est_visible: true,
        est_examen: false,
      },
    ],
  };
  const missions_defi_seul_done: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: true,
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
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: true,
        est_examen: false,
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
    await missionRepository.onApplicationBootstrap();
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
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { missions: missions, defis: defis });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(false);
    expect(response.body.titre).toEqual('titre');
    expect(response.body.introduction).toEqual('intro');
    expect(response.body.image_url).toEqual('image');
    expect(response.body.progression).toEqual({ current: 1, target: 5 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual('titre');
    expect(response.body.univers_label).toEqual('Faut manger !');
    expect(response.body.done_at).toEqual(null);
    expect(response.body.terminable).toEqual(false);
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
  it(`NEW GET /utilisateurs/id/missions/id - renvoie la mission de la thématique - à partir du compte utilisateur`, async () => {
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
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { missions: missions, defis: defis });
    await TestUtil.create(DB.mission, {
      ...mission_articles_tag,
      id_cms: 1,
      code: CodeMission.cereales,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(false);
    expect(response.body.is_examen).toEqual(false);
    expect(response.body.image_url).toEqual('image');
    expect(response.body.progression).toEqual({ current: 1, target: 5 });
    expect(response.body.code).toEqual('cereales');
    expect(response.body.thematique).toEqual(Thematique.alimentation);
    expect(response.body.titre).toEqual('titre');
    expect(response.body.introduction).toEqual('intro');
    expect(response.body.done_at).toEqual(null);
    expect(response.body.terminable).toEqual(false);
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

  it(`GET /utilisateurs/id/thematiques/climat/mission - mission terminable`, async () => {
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
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      missions: missions_defi_seul_done,
      defis: defis,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.done_at).toEqual(null);
    expect(response.body.terminable).toEqual(true);
  });

  it(`NEW GET /utilisateurs/id/missions/id - mission terminable`, async () => {
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
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      missions: missions_defi_seul_done,
      defis: defis,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.done_at).toEqual(null);
    expect(response.body.terminable).toEqual(true);
  });
  it(`GET /utilisateurs/id/thematiques/climat/mission - renvoie la mission de la thématique - à partir du catalgue de mission`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await TestUtil.create(DB.mission, {
      code: CodeMission.cereales,
      thematique: Thematique.alimentation,
      titre: 'Mange de la graine',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.mission,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [],
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 3 });
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
    expect(objectif_article.content_id).toEqual('2');
    expect(objectif_article.type).toEqual(ContentType.article);
    expect(objectif_article.titre).toEqual('obj 2');
    expect(objectif_article.points).toEqual(25);
    expect(objectif_article.is_locked).toEqual(true);
    expect(objectif_article.done_at).toEqual(null);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
  });

  it(`NEW GET /utilisateurs/id/missions/id - renvoie la mission de la thématique - à partir du catalgue de mission`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await TestUtil.create(DB.mission, {
      code: CodeMission.cereales,
      titre: 'Mange de la graine',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.mission,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [],
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 3 });
    expect(response.body.code).toEqual('cereales');
    expect(response.body.thematique).toEqual(Thematique.alimentation);
    expect(response.body.titre).toEqual('Mange de la graine');
    expect(response.body.done_at).toEqual(null);
    expect(response.body.objectifs).toHaveLength(2);

    const objctif_kyc = response.body.objectifs[0];
    expect(objctif_kyc.is_locked).toEqual(false);

    const objectif_article = response.body.objectifs[1];
    expect(objectif_article.id.length).toBeGreaterThan(10);
    expect(objectif_article.content_id).toEqual('2');
    expect(objectif_article.type).toEqual(ContentType.article);
    expect(objectif_article.titre).toEqual('obj 2');
    expect(objectif_article.points).toEqual(25);
    expect(objectif_article.is_locked).toEqual(true);
    expect(objectif_article.done_at).toEqual(null);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
  });

  it(`GET /utilisateurs/utilisateur-id/thematiques/cereales/mission - recalcul une mission avec des articles dynamiques`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: 'autre',
      categorie: Categorie.mission,
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: '222',
        points: 5,
        titre: 'haha',
        type: ContentType.article,
        tag_article: null,
        id_cms: 222,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.objectifs).toHaveLength(4);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(4);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '222',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].content_id).toEqual(
      '0',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].titre).toEqual(
      'hihi',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].titre).toEqual(
      'hoho',
    );
  });

  it(`NEW GET /utilisateurs/utilisateur-id/missions/id - recalcul une mission avec des articles dynamiques`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: 'autre',
      categorie: Categorie.mission,
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: '222',
        points: 5,
        titre: 'haha',
        type: ContentType.article,
        tag_article: null,
        id_cms: 222,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    const mission_articles_tag: Mission = {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      objectifs: objectifs as any,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.objectifs).toHaveLength(4);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(4);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '222',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].content_id).toEqual(
      '0',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].titre).toEqual(
      'hihi',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].titre).toEqual(
      'hoho',
    );
  });

  it(`GET /utilisateurs/utilisateur-id/thematiques/cereales/mission - pas de recalcul articles dynamiques si mission plus nouvelle`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: 'autre',
      categorie: Categorie.mission,
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: '222',
        points: 5,
        titre: 'haha',
        type: ContentType.article,
        tag_article: null,
        id_cms: 222,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    const mission_articles_tag: Mission = {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.objectifs).toHaveLength(2);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(2);
    expect(userDB.missions.getRAWMissions()[0].objectifs[0].content_id).toEqual(
      '_1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '_2',
    );
  });

  it(`NEW GET /utilisateurs/utilisateur-id/missions/id - pas de recalcul articles dynamiques si mission plus nouvelle`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: 'autre',
      categorie: Categorie.mission,
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: '222',
        points: 5,
        titre: 'haha',
        type: ContentType.article,
        tag_article: null,
        id_cms: 222,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    const mission_articles_tag: Mission = {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.objectifs).toHaveLength(2);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(2);
    expect(userDB.missions.getRAWMissions()[0].objectifs[0].content_id).toEqual(
      '_1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '_2',
    );
  });

  it(`GET /utilisateurs/id/thematiques/climat/mission - 404 si pas de mission pour cette thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(404);
  });

  it(`NEW GET /utilisateurs/id/missions/id - 404 si pas de mission pour cette thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/bad',
    );

    // THEN
    expect(response.status).toBe(404);
  });

  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (article)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_article_seul });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.article, {
      content_id: '1',
      points: 0,
    });

    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/000/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (kyc)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_kyc_plus_article,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.test,
      points: 0,
      question: `HAHA`,
      reponses: [],
    });
    await kycRepository.loadDefinitions();

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/_3').send({
      reponse: ['hoho'],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/0/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (quizz)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await TestUtil.create(DB.quizz, {
      content_id: '14',
      points: 0,
    });

    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: 'quizz_score',
      content_id: '14',
      number_value: 100,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/2/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.missions.getRAWMissions()[0].objectifs[2].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });

  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (defi)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await TestUtil.create(DB.defi, {
      content_id: '2',
      points: 0,
    });
    await defiRepository.loadDefinitions();

    await TestUtil.PATCH('/utilisateurs/utilisateur-id/defis/2').send({
      status: DefiStatus.fait,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/3/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(
      userDB.missions.getRAWMissions()[0].objectifs[3].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points pour l'objecif alors que le sous jacent n'est pas done`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/0/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(false);
    expect(userDB.gamification.points).toEqual(10);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points deux fois pour l'objecif donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_article_seul });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await TestUtil.create(DB.article, {
      content_id: '1',
      points: 0,
    });

    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // WHEN
    await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/000/gagner_points',
    );
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/000/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points d'une mission pas vraiment commencer`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    const mission_article: Mission = {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_article);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const read_mission_1 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );
    const id_objectif_1 = read_mission_1.body.objectifs[0].id;

    const reponse_1 = await TestUtil.POST(
      `/utilisateurs/utilisateur-id/objectifs/${id_objectif_1}/gagner_points`,
    );
    // THEN
    expect(reponse_1.status).toBe(201);

    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.gamification.points).toEqual(10);
  });

  it(`NEW GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points d'une mission pas vraiment commencer`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hihi',
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'hoho',
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'composter',
        id_cms: null,
      },
    ];
    const mission_article: Mission = {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_article);

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const read_mission_1 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );
    const id_objectif_1 = read_mission_1.body.objectifs[0].id;

    const reponse_1 = await TestUtil.POST(
      `/utilisateurs/utilisateur-id/objectifs/${id_objectif_1}/gagner_points`,
    );
    // THEN
    expect(reponse_1.status).toBe(201);

    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.gamification.points).toEqual(10);
  });

  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour deux KYC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
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
    await kycRepository.loadDefinitions();

    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/_1').send({
      reponse: ['haha'],
    });
    await TestUtil.PUT('/utilisateurs/utilisateur-id/questionsKYC/_1').send({
      reponse: ['hehe'],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/111/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[1].sont_points_en_poche,
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

  it(`NEW GET /utilisateurs/id/missions/cereales/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
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
        { label: 'A voir', code: 'peut_etre' },
      ],
    });
    await kycRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_3',
    ).send({ reponse: ['Oui'] });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué lecture du dernier article`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '1' });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await defiRepository.loadDefinitions();

    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].est_reco).toEqual(
      true,
    );

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );
    // THEN
    expect(response.body.objectifs).toHaveLength(2);
    const objctif_defi = response.body.objectifs[1];
    expect(objctif_defi.is_reco).toEqual(true);
  });

  it(`NEW GET /utilisateurs/:utilisateurId/missions/id - un defi débloqué lecture du dernier article`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '1' });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await defiRepository.loadDefinitions();

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].est_reco).toEqual(
      true,
    );

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
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
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await defiRepository.loadDefinitions();

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
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
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );
    // THEN
    expect(response.body.objectifs).toHaveLength(2);
    const objctif_defi = response.body.objectifs[1];
    expect(objctif_defi.is_reco).toEqual(false);
  });

  it(`NEW GET /utilisateurs/:utilisateurId/missions/id - un defi débloqué lecture du dernier article, mais non visible car condition par remplie`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ code_kyc: '1', code_reponse: 'yi' }]],
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await defiRepository.loadDefinitions();

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
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
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );
    // THEN
    expect(response.body.objectifs).toHaveLength(2);
    const objctif_defi = response.body.objectifs[1];
    expect(objctif_defi.is_reco).toEqual(false);
  });

  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué lecture du dernier article,  visible car condition remplie`, async () => {
    // GIVEN
    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: '1',
          id_cms: 1,
          last_update: undefined,
          question: `Question`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            {
              label: 'YO',
              code: 'yo',
              ngc_code: undefined,
              selected: true,
            },
            {
              label: 'YI',
              code: 'yi',
              ngc_code: undefined,
              selected: true,
            },
            {
              label: 'YA',
              code: 'ya',
              ngc_code: undefined,
              selected: false,
            },
          ],
          ngc_key: undefined,
          tags: [],
          thematique: Thematique.alimentation,
          reponse_simple: undefined,
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
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.defi, {
      content_id: '1',
      conditions: [[{ id_kyc: 1, code_kyc: '1', code_reponse: 'yi' }]],
    });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].est_reco).toEqual(
      true,
    );
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué suite dernier quizz`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_quizz_plus_defi,
    });
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '1',
      number_value: 100,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '2',
    );
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(false);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un defi débloqué suite dernier quizz, même si raté, et points déjà en poche`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_quizz_plus_defi,
    });
    await TestUtil.create(DB.quizz, { content_id: '1' });
    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '1',
      number_value: 0,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].is_locked).toEqual(
      false,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '2',
    );
    expect(
      userDB.missions.getRAWMissions()[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
  });

  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - NON ajout mission si dernier defi abondonné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_defi_seul,
    });
    await TestUtil.create(DB.defi, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: false,
      code: CodeMission.cereales,
    });
    await defiRepository.loadDefinitions();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.abondon,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    userDB.missions.setCatalogue(MissionRepository.getCatalogue());

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

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/mission',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 3 });
  });

  it(`NEW GET /utilisateurs/:utilisateurId/missions/id - is_new true si rien fait`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_article_plus_defi,
    });
    await TestUtil.create(DB.article, { content_id: '1' });

    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.is_new).toEqual(true);
    expect(response.body.progression).toEqual({ current: 0, target: 3 });
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

  it(`NEW GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });

  it(`GET /utilisateurs/id/thematiques/id/tuiles_missions - Liste les missions de la thématique, 100% catalogue`, async () => {
    // GIVEN

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: '11',
        points: 5,
        titre: 'yop',
        type: ContentType.kyc,
        tag_article: null,
        id_cms: 11,
      },
      {
        content_id: '22',
        points: 5,
        titre: 'haha',
        type: ContentType.article,
        tag_article: null,
        id_cms: 22,
      },
    ];

    const mission_article: Mission = {
      id_cms: 1,
      est_visible: true,
      objectifs: objectifs as any,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      est_examen: true,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_1',
      id_cms: 1,
    });
    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_2',
      id_cms: 2,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await missionRepository.onApplicationBootstrap();
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/tuiles_missions_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual({
      cible_progression: 2,
      code: 'code_1',
      image_url: 'img',
      is_new: true,
      is_examen: true,
      progression: 0,
      thematique: 'alimentation',
      thematique_label: 'Faut manger !',
      titre: 'titre',
      type_mission: 'examen',
    });
  });
  it(`GET /utilisateurs/id/thematiques/id/tuiles_missions - Liste pas mission de la thématique si non visible`, async () => {
    // GIVEN

    const mission_article: Mission = {
      id_cms: 1,
      est_visible: false,
      est_examen: false,
      objectifs: [],
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_1',
      id_cms: 1,
    });

    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it(`GET /utilisateurs/id/thematiques/id/tuiles_missions - Liste la mission 'is_first' en premier`, async () => {
    // GIVEN

    const mission_article: Mission = {
      id_cms: 1,
      est_visible: true,
      objectifs: [],
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      est_examen: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_1',
      id_cms: 1,
      is_first: false,
    });
    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_2',
      id_cms: 2,
      is_first: true,
    });
    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_3',
      id_cms: 3,
      is_first: false,
    });

    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].code).toEqual('code_2');
  });
  it(`GET /utilisateurs/id/thematiques/id/tuiles_missions - liste inclut une mission en cours de l'utilisateur, maj avec la def`, async () => {
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
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { missions: missions, defis: defis });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.defi, { content_id: '2' });
    await defiRepository.loadDefinitions();

    const mission_article: Mission = {
      id_cms: 1,
      est_visible: true,
      objectifs: [],
      code: CodeMission.cereales,
      image_url: 'NEW img',
      thematique: Thematique.alimentation,
      titre: 'NEW titre',
      introduction: 'NEW intro',
      is_first: false,
      est_examen: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.mission, {
      ...mission_article,
    });

    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      cible_progression: 5,
      code: CodeMission.cereales,
      image_url: 'NEW img',
      is_new: false,
      is_examen: false,
      progression: 1,
      thematique: 'alimentation',
      thematique_label: 'Faut manger !',
      titre: 'NEW titre',
      type_mission: 'standard',
    });
  });

  it(`NEW GET /utilisateurs/id/tuiles_missions - renvoie la liste des missions recommandées pour l'utilisateur, premiere mission de chaque univers`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.logement,
      label: 'Maison',
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      thematique: Thematique.alimentation,
      code: CodeMission.cereales,
      titre: 'cereales',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      thematique: Thematique.alimentation,
      code: CodeMission.coming_soon,
      titre: 'coming_soon',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 3,
      thematique: Thematique.logement,
      code: CodeMission.partir_vacances,
      titre: 'partir_vacances',
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].titre).toEqual('cereales');
    expect(response.body[1].titre).toEqual('partir_vacances');
  });

  it(`NEW GET /utilisateurs/id/tuiles_missions - une tuile terminée n'apparaît pas`, async () => {
    // GIVEN
    const mission_unique_done: MissionsUtilisateur_v1 = {
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(),
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
          ],
          est_visible: true,
          est_examen: false,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, { missions: mission_unique_done });

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.alimentation,
      label: 'Faut manger !',
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      code: CodeMission.cereales,
    });
    await missionRepository.onApplicationBootstrap();
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
