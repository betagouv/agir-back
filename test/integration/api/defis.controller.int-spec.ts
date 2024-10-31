import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Tag } from '../../../src/domain/scoring/tag';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { DefiAPI } from '../../../src/infrastructure/api/types/defis/DefiAPI';
import {
  DefiHistory_v0,
  Defi_v0,
} from '../../../src/domain/object_store/defi/defiHistory_v0';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../src/domain/univers/univers';
import { Defi } from '.prisma/client';
import { PonderationApplicativeManager } from '../../../src/domain/scoring/ponderationApplicative';
import { TagRubrique } from '../../../src/domain/scoring/tagRubrique';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Feature } from '../../../src/domain/gamification/feature';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { Gamification_v0 } from '../../../src/domain/object_store/gamification/gamification_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';

const DEFI_1_DEF: Defi = {
  content_id: '1',
  points: 5,
  tags: [Tag.utilise_moto_ou_voiture],
  titre: 'titre',
  thematique: Thematique.alimentation,
  astuces: 'astuce',
  pourquoi: 'pourquoi',
  sous_titre: 'sous_titre',
  universes: [Univers.climat],
  thematiquesUnivers: [ThematiqueUnivers.dechets_compost],
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
  const DAY_IN_MS = 1000 * 60 * 60 * 24;

  const missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: 'alimentation',
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        is_first: false,
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
        thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
        univers: 'alimentation',
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        is_first: false,
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
        thematique_univers: ThematiqueUnivers.mobilite_quotidien,
        univers: 'alimentation',
        code: 'code',
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        is_first: false,
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
    universes: [Univers.climat],
    accessible: true,
    motif: 'truc',
    categorie: Categorie.recommandation,
    conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
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
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur', async () => {
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
          status: DefiStatus.deja_fait,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.abondon,
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
      defis: defis,
      logement,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/defis');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('001');
    expect(defi.points).toBe(5);
    expect(defi.thematique).toBe(Thematique.alimentation);
    expect(defi.astuces).toBe('astuce');
    expect(defi.pourquoi).toBe('pourquoi');
    expect(defi.jours_restants).toBe(4);
    expect(defi.titre).toBe('Défi à Palaiseau');
    expect(defi.motif).toBe('truc');
    expect(defi.sous_titre).toBe('sous_titre');
    expect(defi.status).toBe(DefiStatus.en_cours);
    expect(defi.universes[0]).toBe(Univers.climat);
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur par univers', async () => {
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

    const missions_defi_seul: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: null,
          thematique_univers: ThematiqueUnivers.cereales,
          univers: 'alimentation',
          code: 'code',
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          is_first: false,
          objectifs: [
            {
              id: '0',
              content_id: '001',
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
              content_id: '002',
              type: ContentType.defi,
              titre: '1 defi',
              points: 10,
              is_locked: false,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '2',
              content_id: '003',
              type: ContentType.defi,
              titre: '1 defi',
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

    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions_defi_seul,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/defis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('001');
  });

  it('NEW GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur par univers', async () => {
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

    const missions_defi_seul: MissionsUtilisateur_v0 = {
      version: 0,
      missions: [
        {
          id: '1',
          done_at: null,
          thematique_univers: ThematiqueUnivers.cereales,
          univers: 'alimentation',
          code: 'code',
          image_url: 'image',
          thematique: Thematique.alimentation,
          titre: 'titre',
          is_first: false,
          objectifs: [
            {
              id: '0',
              content_id: '001',
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
              content_id: '002',
              type: ContentType.defi,
              titre: '1 defi',
              points: 10,
              is_locked: false,
              done_at: null,
              sont_points_en_poche: false,
              est_reco: true,
            },
            {
              id: '2',
              content_id: '003',
              type: ContentType.defi,
              titre: '1 defi',
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

    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions_defi_seul,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/defis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('001');
  });

  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur par univers, sauf si fait', async () => {
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
          status: DefiStatus.todo,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.todo,
        },
      ],
    };

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'dechets compost',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'gaspillage alimentaire',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/defis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('NEW GET /utilisateurs/utilisateur-id/thematiques/id/defis - liste defis de l utilisateur par univers, sauf si fait', async () => {
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
          status: DefiStatus.todo,
        },
        {
          ...DEFI_1,
          id: '003',
          status: DefiStatus.todo,
        },
      ],
    };

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'dechets compost',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'gaspillage alimentaire',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/defis',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu (v2), pas les défis locked', async () => {
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

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'dechets compost',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'mobilite quotidien',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    expect(response.body[0].id).toEqual('003');
    expect(response.body[1].id).toEqual('001');
  });
  it('GET /utilisateurs/utilisateur-id/defis - liste defis de l utilisateur tout confondu en cours ou todo, donc pas le reste (v2)', async () => {
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

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'Climat',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.transport,
      label: 'Transport',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.alimentation,
      label: 'Alimentation',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'Cereales',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      univers_parent: Univers.alimentation,
      label: 'dechets compost',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: ThematiqueUnivers.mobilite_quotidien,
      univers_parent: Univers.transport,
      label: 'mobilite quotidien',
      image_url: 'aaaa',
    });
    await thematiqueRepository.onApplicationBootstrap();

    await TestUtil.create(DB.utilisateur, {
      defis: defis,
      missions: missions,
    });
    await TestUtil.create(DB.article, { content_id: '12' });
    await TestUtil.create(DB.article, { content_id: '13' });
    await TestUtil.create(DB.article, { content_id: '14' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status encours', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.deja_fait,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=en_cours',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('1');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status encours et deja fait', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.pas_envie,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.deja_fait,
        },
        {
          ...DEFI_1,
          id: '3',
          status: DefiStatus.en_cours,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=en_cours&status=deja_fait',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);

    const defi_1: DefiAPI = response.body[0];
    const defi_2: DefiAPI = response.body[1];

    expect(defi_1.id).toBe('2');
    expect(defi_2.id).toBe('3');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status todo', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.deja_fait,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('3');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre accessible', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.todo,
          accessible: false,
        },
        {
          ...DEFI_1,
          id: '2',
          status: DefiStatus.todo,
          accessible: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '1' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '2' });
    await TestUtil.create(DB.defi, { ...DEFI_1_DEF, content_id: '3' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo&accessible=true',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('2');
  });
  it('GET /utilisateurs/utilisateur-id/defis - filtre status todo et univers', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
    });

    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      universes: [Univers.alimentation],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      universes: [Univers.climat],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      universes: [Univers.logement],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo&univers=climat',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const defi: DefiAPI = response.body[0];

    expect(defi.id).toBe('2');
  });
  it('GET /utilisateurs/id/defis?status=todo - liste des défis à a faire par ordre de reco', async () => {
    // GIVEN
    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [],
    };
    await TestUtil.create(DB.utilisateur, {
      defis: defis,
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
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '1',
      tags: [TagRubrique.R3],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '2',
      tags: [TagRubrique.R1],
    });
    await TestUtil.create(DB.defi, {
      ...DEFI_1_DEF,
      content_id: '3',
      tags: [TagRubrique.R2],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/defis?status=todo',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0].id).toEqual('1');
    expect(response.body[1].id).toEqual('3');
    expect(response.body[2].id).toEqual('2');
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
      },
      logement,
    });
    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await thematiqueRepository.loadThematiques();

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
          universes: [],
          accessible: true,
          motif: null,
          categorie: Categorie.recommandation,
          mois: [1],
          conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
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

    await TestUtil.create(DB.utilisateur, { defis: defis, logement });

    ThematiqueRepository.resetAllRefs();
    await TestUtil.create(DB.thematique, {
      id: '1',
      id_cms: 1,
      titre: 't1',
    });
    await TestUtil.create(DB.defiStatistique, {
      content_id: '001',
      nombre_defis_realises: 123,
    });
    await thematiqueRepository.loadThematiques();

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
          universes: [],
          accessible: true,
          motif: null,
          categorie: Categorie.recommandation,
          mois: [1],
          conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
          sont_points_en_poche: true,
          impact_kg_co2: 5,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { defis: defis });

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
      unlocked_features: unlocked,
      gamification: gamification,
    });
    await TestUtil.create(DB.defi, DEFI_1_DEF);

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
    expect(userDB.defi_history.defis).toHaveLength(2);
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
