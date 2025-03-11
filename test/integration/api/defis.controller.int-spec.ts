import { Defi } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { Feature } from '../../../src/domain/gamification/feature';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { CodeMission } from '../../../src/domain/mission/codeMission';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { Tag } from '../../../src/domain/scoring/tag';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { DefiAPI } from '../../../src/infrastructure/api/types/defis/DefiAPI';
import { ArticleRepository } from '../../../src/infrastructure/repository/article.repository';
import { DefiRepository } from '../../../src/infrastructure/repository/defi.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

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
  mois: [0],
  conditions: [[{ code_kyc: '123', code_reponse: 'oui' }]],
  impact_kg_co2: 5,
};

describe('/utilisateurs/id/defis (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const defiRepository = new DefiRepository(TestUtil.prisma);
  const articleRepository = new ArticleRepository(TestUtil.prisma);

  const DAY_IN_MS = 1000 * 60 * 60 * 24;

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
        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '12',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: new Date(0),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '001',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        code: CodeMission.gaspillage_alimentaire,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',

        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '13',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '002',
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
      {
        id: '3',
        done_at: null,
        code: CodeMission.mobilite_quotidien,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',

        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '14',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '003',
            type: ContentType.defi,
            titre: 'Action à faire',
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

  const missions_all_defi_unlocked: MissionsUtilisateur_v1 = {
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

        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '12',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: new Date(0),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '001',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        code: CodeMission.gaspillage_alimentaire,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',

        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '13',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '002',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: true,
      },
      {
        id: '3',
        done_at: null,
        code: CodeMission.mobilite_quotidien,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',

        is_first: false,
        est_examen: false,
        objectifs: [
          {
            id: '1',
            content_id: '14',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: false,
            done_at: new Date(),
            sont_points_en_poche: false,
            est_reco: true,
          },
          {
            id: '3',
            content_id: '003',
            type: ContentType.defi,
            titre: 'Action à faire',
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

  const DEFI_1: Defi_v0 = {
    id: '1',
    points: 5,
    tags: [Tag.utilise_moto_ou_voiture],
    titre: 'Défi à {COMMUNE}',
    thematique: Thematique.alimentation,
    astuces: 'astuce',
    date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
    pourquoi: 'pourquoi',
    sous_titre: 'sous_titre',
    status: DefiStatus.todo,
    accessible: true,
    motif: 'truc',
    categorie: Categorie.recommandation,
    conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
    mois: [1],
    sont_points_en_poche: true,
    impact_kg_co2: 5,
  };

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await defiRepository.loadCache();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/utilisateur-id/defis_v2 - liste defis de l utilisateur tout confondu (v2), pas les défis locked', async () => {
    // GIVEN
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
          id: '002',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.en_cours,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    response.body.sort((a, b) => (a.id > b.id ? -1 : 1));
    expect(response.body.length).toBe(2);

    expect(response.body[0].id).toEqual('003');
    expect(response.body[1].id).toEqual('001');
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu sauf todo', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions_all_defi_unlocked as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu sauf todo, reste des status', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.todo,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions_all_defi_unlocked as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body.find((d) => d.id === '003')).toEqual(undefined);
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu sauf todo, + filtrage par status', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions_all_defi_unlocked as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2?status=fait&status=abondon',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body.find((d) => d.id === '003')).toEqual(undefined);
  });

  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu sauf todo, + filtrage par status unique', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions_all_defi_unlocked as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2?status=fait',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].id).toEqual('001');
  });

  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu sauf todo, + filtrage par thematique', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '001',
          status: DefiStatus.fait,
        },
        {
          ...DEFI_1,
          id: '002',
          status: DefiStatus.abondon,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.pas_envie,
        },
      ],
    };

    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 3,
      code: Thematique.alimentation,
      label: 'Alimentation',
    });

    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis as any,
      missions: missions_all_defi_unlocked as any,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });
    await articleRepository.loadCache();

    // WHEN
    let response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2?thematique=climat',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);

    // WHEN
    response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2?thematique=alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });

  it('GET /utilisateurs/id/defis/id - correct data defis du catalogue', async () => {
    // GIVEN
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
      history: {},
      defis: {
        defis: [DEFI_1],
      } as any,
      logement: logement as any,
    });
    ThematiqueRepository.resetCache();
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      label: 't1',
    });
    await thematiqueRepository.loadCache();
    await defiRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/defis/1');

    // THEN
    expect(response.status).toBe(200);

    const defi: DefiAPI = response.body;

    expect(defi.id).toBe('1');
    expect(defi.points).toBe(5);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('astuce');
    expect(defi.pourquoi).toBe('pourquoi');
    expect(defi.jours_restants).toBe(4);
    expect(defi.titre).toBe('Défi à Palaiseau');
    expect(defi.sous_titre).toBe('sous_titre');
    expect(defi.thematique_label).toBe('t1');
    expect(defi.status).toBe(DefiStatus.todo);
    expect(defi.nombre_de_fois_realise).toEqual(0);
  });
  it('GET /utilisateurs/id/defis/id - correct data defis utlisateur', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '001',
          points: 10,
          tags: [Tag.R10],
          titre: 'Défi à {COMMUNE}',
          thematique: Thematique.alimentation,
          astuces: 'ASTUCE',
          date_acceptation: new Date(Date.now() - 2 * DAY_IN_MS),
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.en_cours,
          accessible: true,
          motif: null,
          categorie: Categorie.recommandation,
          mois: [1],
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          sont_points_en_poche: true,
          impact_kg_co2: 5,
        },
      ],
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
      defis: defis as any,
      logement: logement as any,
    });

    ThematiqueRepository.resetCache();
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      label: 't1',
    });
    await TestUtil.create(DB.defiStatistique, {
      content_id: '001',
      nombre_defis_realises: 123,
    });
    await thematiqueRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis/001',
    );

    // THEN
    expect(response.status).toBe(200);

    const defi: DefiAPI = response.body;

    expect(defi.id).toBe('001');
    expect(defi.points).toBe(10);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('ASTUCE');
    expect(defi.pourquoi).toBe('POURQUOI');
    expect(defi.jours_restants).toBe(5);
    expect(defi.titre).toBe('Défi à Palaiseau');
    expect(defi.sous_titre).toBe('SOUS TITRE');
    expect(defi.thematique_label).toBe('t1');
    expect(defi.status).toBe(DefiStatus.en_cours);
    expect(defi.nombre_de_fois_realise).toEqual(123);
  });
  it('PATCH /utilisateurs/id/defis/id - patch le status d un defi en cours', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '001',
          points: 10,
          tags: [Tag.R10],
          titre: 'titre',
          thematique: Thematique.alimentation,
          astuces: 'ASTUCE',
          date_acceptation: new Date(Date.now() - 2 * DAY_IN_MS),
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.en_cours,
          accessible: true,
          motif: null,
          categorie: Categorie.recommandation,
          mois: [1],
          conditions: [[{ id_kyc: 1, code_reponse: 'oui' }]],
          sont_points_en_poche: true,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { defis: defis as any });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/001',
    ).send({
      status: DefiStatus.fait,
      motif: 'null ce défi',
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const defi_user = userDB.defi_history.getDefiOrException('001');
    expect(defi_user.getStatus()).toBe(DefiStatus.fait);
    expect(defi_user.motif).toBe('null ce défi');
  });
  it('PATCH /utilisateurs/id/defis/id - patch le status d un defi du catalogue, débloques la feature defi et active le reveal defi', async () => {
    // GIVEN
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [],
    };
    const gamification: Gamification_v0 = {
      version: 0,
      points: 0,
      celebrations: [],
    };

    await TestUtil.create(DB.utilisateur, {
      unlocked_features: unlocked as any,
      gamification: gamification as any,
    });
    await TestUtil.create(DB.defi, DEFI_1_DEF);
    await defiRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.en_cours,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    const defi = userDB.defi_history.getDefiOrException('1');

    expect(defi.getStatus()).toBe(DefiStatus.en_cours);
    expect(defi.date_acceptation.getTime() + 100).toBeGreaterThan(Date.now());
    expect(defi.date_acceptation.getTime() - 100).toBeLessThan(Date.now());
    expect(userDB.defi_history.getRAWDefiListe()).toHaveLength(2);
    expect(userDB.unlocked_features.unlocked_features).toHaveLength(1);
    expect(userDB.unlocked_features.unlocked_features[0]).toEqual(
      Feature.defis,
    );
    expect(userDB.gamification.celebrations).toHaveLength(0);
  });
  it('PATCH /utilisateurs/id/defis/id - ajout de points', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    await TestUtil.create(DB.defi, DEFI_1_DEF);
    await defiRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/defis/1',
    ).send({
      status: DefiStatus.fait,
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(userDB.gamification.points).toBe(15);
  });
});
