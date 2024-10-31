import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Univers } from '../../../src/domain/univers/univers';
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
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { DefiHistory_v0 } from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { ObjectifDefinition } from '../../../src/domain/mission/missionDefinition';
import { Mission } from '@prisma/client';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import {
  MosaicKYC,
  MosaicKYCDef,
  TypeReponseMosaicKYC,
} from '../../../src/domain/kyc/mosaicKYC';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { MissionRepository } from '../../../src/infrastructure/repository/mission.repository';

describe('Mission (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);

  const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
      id: KYCMosaicID.TEST_MOSAIC_ID,
      categorie: Categorie.test,
      points: 10,
      titre: 'Titre test',
      type: TypeReponseMosaicKYC.mosaic_boolean,
      question_kyc_codes: [KYCID._2, KYCID._3],
    },
  ];

  const missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        code: ThematiqueUnivers.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
      },
    ],
  };
  const mission_avec_mosaic: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        code: ThematiqueUnivers.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
      },
    ],
  };
  const missions_article_plus_defi: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        code: ThematiqueUnivers.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: ThematiqueUnivers.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
      },
    ],
  };
  const missions_defi_seul_done: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: Univers.alimentation,
        code: ThematiqueUnivers.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
          sont_points_en_poche: false,
          impact_kg_co2: 5,
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
    expect(response.body.progression).toEqual({ current: 1, target: 5 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
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
          universes: [Univers.climat],
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
      '/utilisateurs/utilisateur-id/missions/cereales',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(false);
    expect(response.body.image_url).toEqual('aaaa');
    expect(response.body.progression).toEqual({ current: 1, target: 5 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
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
          universes: [Univers.climat],
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
          universes: [Univers.climat],
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

    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

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
    expect(userDB.missions.missions).toHaveLength(1);
  });

  it(`NEW GET /utilisateurs/id/missions/id - renvoie la mission de la thématique - à partir du catalgue de mission`, async () => {
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

    await TestUtil.create(DB.mission, { code: ThematiqueUnivers.cereales });
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales',
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
    expect(userDB.missions.missions).toHaveLength(1);
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
    const mission_articles_tag: Mission = {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: objectifs as any,
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(4);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('222');
    expect(userDB.missions.missions[0].objectifs[1].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].content_id).toEqual('0');
    expect(userDB.missions.missions[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].titre).toEqual('hihi');
    expect(userDB.missions.missions[0].objectifs[3].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[3].titre).toEqual('hoho');
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: objectifs as any,
      code: ThematiqueUnivers.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(4);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('222');
    expect(userDB.missions.missions[0].objectifs[1].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].content_id).toEqual('0');
    expect(userDB.missions.missions[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].titre).toEqual('hihi');
    expect(userDB.missions.missions[0].objectifs[3].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[3].titre).toEqual('hoho');
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      code: 'ThematiqueUnivers.cereales',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(2);
    expect(userDB.missions.missions[0].objectifs[0].content_id).toEqual('_1');
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('_2');
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      code: ThematiqueUnivers.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: missions_2_KYC });

    await TestUtil.create(DB.mission, mission_articles_tag);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(2);
    expect(userDB.missions.missions[0].objectifs[0].content_id).toEqual('_1');
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('_2');
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
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (kyc)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_kyc_plus_article,
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

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.libre,
      categorie: Categorie.test,
      points: 0,
      question: `HAHA`,
      reponses: [],
    });

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
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (quizz)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
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
      userDB.missions.missions[0].objectifs[2].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });

  it(`GET /utilisateurs/id/objectifs/id/gagner_points - empoche les points pour l'objecif donné (defi)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
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
    await TestUtil.create(DB.defi, {
      content_id: '2',
      points: 0,
    });

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
      userDB.missions.missions[0].objectifs[3].sont_points_en_poche,
    ).toEqual(true);
    expect(userDB.gamification.points).toEqual(20);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points pour l'objecif alors que le sous jacent n'est pas done`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions,
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
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/objectifs/0/gagner_points',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
    ).toEqual(false);
    expect(userDB.gamification.points).toEqual(10);
  });
  it(`GET /utilisateurs/id/objectifs/id/gagner_points - n'empoche pas les points deux fois pour l'objecif donné`, async () => {
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
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_article);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      code: ThematiqueUnivers.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      is_first: false,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, { missions: {} });

    await TestUtil.create(DB.mission, mission_article);

    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
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

  it(`GET /utilisateurs/id/thematiques/cereales/kycs - renvoie la liste des questions à poser`, async () => {
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
        { label: 'A voir', code: 'peut_etre' },
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

  it(`NEW GET /utilisateurs/id/missions/cereales/kycs - renvoie la liste des questions à poser`, async () => {
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
        { label: 'A voir', code: 'peut_etre' },
      ],
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales/kycs',
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

  it(`GET /utilisateurs/id/thematiques/cereales/kycs - renvoie la liste des questions à poser avec une mosaic`, async () => {
    // GIVEN
    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      missions: mission_avec_mosaic,
      kyc: kyc,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
      short_question: 'short 1',
      image_url: 'AAA',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Encore une question`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: 'peut_etre' },
      ],
      short_question: 'short 2',
      image_url: 'BBB',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 3,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: 'peut_etre' },
      ],
      short_question: 'short 3',
      image_url: 'CCC',
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/cereales/kycs',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual({
      id: '_1',
      question: 'Comment avez vous connu le service ?',
      reponse: [],
      reponses_possibles: [
        'Moins de 15 ans (neuf ou récent)',
        'Plus de 15 ans (ancien)',
      ],
      categorie: 'test',
      points: 10,
      type: 'choix_unique',
      is_NGC: false,
      thematique: 'climat',
    });
    expect(response.body[1]).toEqual({
      id: 'TEST_MOSAIC_ID',
      titre: 'Titre test',
      is_answered: false,
      reponses: [
        {
          code: '_2',
          image_url: 'BBB',
          label: 'short 2',
          boolean_value: false,
          emoji: '🎉',
        },
        {
          code: '_3',
          image_url: 'CCC',
          label: 'short 3',
          boolean_value: false,
          emoji: '🎉',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
    });
    expect(response.body[2]).toEqual({
      id: '_3',
      question:
        "Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?",
      reponse: [],
      reponses_possibles: ['Oui', 'Non', 'A voir'],
      categorie: 'test',
      points: 10,
      type: 'choix_unique',
      is_NGC: false,
      thematique: 'climat',
    });
  });

  it(`NEW GET /utilisateurs/id/missions/cereales/kycs - renvoie la liste des questions à poser avec une mosaic`, async () => {
    // GIVEN
    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      missions: mission_avec_mosaic,
      kyc: kyc,
    });

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._1,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
      short_question: 'short 1',
      image_url: 'AAA',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Encore une question`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: 'peut_etre' },
      ],
      short_question: 'short 2',
      image_url: 'BBB',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 3,
      code: KYCID._3,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
      reponses: [
        { label: 'Oui', code: BooleanKYC.oui },
        { label: 'Non', code: BooleanKYC.non },
        { label: 'A voir', code: 'peut_etre' },
      ],
      short_question: 'short 3',
      image_url: 'CCC',
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/cereales/kycs',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual({
      id: '_1',
      question: 'Comment avez vous connu le service ?',
      reponse: [],
      reponses_possibles: [
        'Moins de 15 ans (neuf ou récent)',
        'Plus de 15 ans (ancien)',
      ],
      categorie: 'test',
      points: 10,
      type: 'choix_unique',
      is_NGC: false,
      thematique: 'climat',
    });
    expect(response.body[1]).toEqual({
      id: 'TEST_MOSAIC_ID',
      titre: 'Titre test',
      is_answered: false,
      reponses: [
        {
          code: '_2',
          image_url: 'BBB',
          label: 'short 2',
          boolean_value: false,
          emoji: '🎉',
        },
        {
          code: '_3',
          image_url: 'CCC',
          label: 'short 3',
          boolean_value: false,
          emoji: '🎉',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
    });
    expect(response.body[2]).toEqual({
      id: '_3',
      question:
        "Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?",
      reponse: [],
      reponses_possibles: ['Oui', 'Non', 'A voir'],
      categorie: 'test',
      points: 10,
      type: 'choix_unique',
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
        { label: 'A voir', code: 'peut_etre' },
      ],
    });

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/_3',
    ).send({ reponse: ['Oui'] });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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

  it(`NEW GET /utilisateurs/:utilisateurId/missions/id - un defi débloqué lecture du dernier article`, async () => {
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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(true);

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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[1].est_reco).toEqual(false);

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
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions[0].objectifs[1].is_locked).toEqual(false);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('2');
    expect(
      userDB.missions.missions[0].objectifs[0].sont_points_en_poche,
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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: objectifs as any,
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
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
    await TestUtil.create(DB.mission, {
      ...mission_article,
      code: 'code_2',
      id_cms: 2,
    });
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Faut manger !',
    });

    await missionRepository.onApplicationBootstrap();
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/tuiles_missions',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toEqual({
      cible_progression: 2,
      code: 'code_1',
      image_url: 'img',
      is_new: true,
      progression: 0,
      thematique: 'alimentation',
      thematique_label: 'Faut manger !',
      titre: 'titre',
    });
  });
  it(`GET /utilisateurs/id/thematiques/id/tuiles_missions - Liste pas mission de la thématique si non visible`, async () => {
    // GIVEN

    const mission_article: Mission = {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: false,
      objectifs: [],
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
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
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: [],
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      is_first: false,
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
          universes: [Univers.climat],
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

    const mission_article: Mission = {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: [],
      code: ThematiqueUnivers.cereales,
      image_url: 'NEW img',
      thematique: Thematique.alimentation,
      titre: 'NEW titre',
      is_first: false,
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
      code: ThematiqueUnivers.cereales,
      image_url: 'NEW img',
      is_new: false,
      progression: 1,
      thematique: 'alimentation',
      thematique_label: 'Faut manger !',
      titre: 'NEW titre',
    });
  });

  it(`NEW GET /utilisateurs/id/tuiles_missions - renvoie la liste des missions recommandées pour l'utilisateur, premiere mission de chaque univers`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: {} });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'Faut manger !',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.logement,
      label: 'Maison',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      label: 'cereales',
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      label: 'coming_soon',
      code: ThematiqueUnivers.coming_soon,
      univers_parent: Univers.alimentation,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      label: 'partir_vacances',
      code: ThematiqueUnivers.partir_vacances,
      univers_parent: Univers.logement,
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      thematique: Thematique.alimentation,
      code: ThematiqueUnivers.cereales,
      titre: 'cereales',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      thematique: Thematique.alimentation,
      code: ThematiqueUnivers.coming_soon,
      titre: 'coming_soon',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 3,
      thematique: Thematique.logement,
      code: ThematiqueUnivers.partir_vacances,
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
    console.log(response.body);
    expect(response.body[0].titre).toEqual('cereales');
    expect(response.body[1].titre).toEqual('partir_vacances');
  });

  it(`NEW GET /utilisateurs/id/tuiles_missions - une tuile terminée n'apparaît pas`, async () => {
    // GIVEN
    const mission_unique_done: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(),
          thematique_univers: ThematiqueUnivers.cereales,
          univers: 'alimentation',
          code: ThematiqueUnivers.cereales,
          image_url: 'img',
          thematique: Thematique.alimentation,
          titre: 'titre',
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
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, { missions: mission_unique_done });

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'Faut manger !',
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      code: ThematiqueUnivers.cereales,
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
