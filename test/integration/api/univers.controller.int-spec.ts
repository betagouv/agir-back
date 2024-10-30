import { DB, TestUtil } from '../../TestUtil';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { ParcoursTodo_v0 } from '../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Mission } from '.prisma/client';
import { ObjectifDefinition } from '../../../src/domain/mission/missionDefinition';
import { Categorie } from '../../../src/domain/contenu/categorie';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { MissionRepository } from '../../../src/infrastructure/repository/mission.repository';

describe('Univers (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  const sept_missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: 'A',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        ],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        thematique_univers: 'B',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
            type: ContentType.article,
            titre: '1 article',
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
        done_at: new Date(),
        thematique_univers: 'C',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '1',
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
      {
        id: '4',
        done_at: null,
        thematique_univers: 'D',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
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
        id: '5',
        done_at: null,
        thematique_univers: 'E',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
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
        id: '6',
        done_at: null,
        thematique_univers: 'F',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
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
        id: '7',
        done_at: null,
        thematique_univers: 'G',
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
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
  const mission_unique: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
  const mission_unique_done: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: new Date(),
        thematique_univers: ThematiqueUnivers.cereales,
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
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

  const missions_visible_pas_visible: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
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
        ],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        thematique_univers: ThematiqueUnivers.dechets_compost,
        univers: 'alimentation',
        code: 'code',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        objectifs: [
          {
            id: '0',
            content_id: '2',
            type: ContentType.article,
            titre: '2 article',
            points: 10,
            is_locked: false,
            done_at: null,
            sont_points_en_poche: false,
            est_reco: true,
          },
        ],
        est_visible: false,
      },
    ],
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

  it(`GET /utilisateurs/id/univers - liste les univers de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'yo',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toEqual({
      etoiles: 0,
      titre: 'yo',
      type: Univers.climat,
      image_url: 'aaaa',
      is_done: false,
    });
  });
  it(`GET /utilisateurs/id/univers - liste les univers de l'utilisateur, is_done à true`, async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 3;

    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique_done,
      todo: todo,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].is_done).toEqual(true);
  });

  it(`GET /utilisateurs/id/univers/id/thematiques - liste une thematique, donnée correctes, ajout mission à utilisateur si visible`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique,
    });
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: true,
      thematique_univers: ThematiqueUnivers.cereales,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: true,
      thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
    });

    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      label: `jette pas !!`,
      image_url: 'bbb',
      niveau: 2,
      univers_parent: Univers.alimentation,
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toEqual({
      titre: `Les céréales c'est bon`,
      type: ThematiqueUnivers.cereales,
      progression: 1,
      cible_progression: 2,
      is_locked: false,
      reason_locked: null,
      is_new: false,
      niveau: 2,
      image_url: 'aaaa',
      univers_parent: Univers.alimentation,
      univers_parent_label: 'Manger !',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(2);
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste une thematique, donnée correctes, NON ajout mission à utilisateur si PAS visible`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique,
    });
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: true,
      thematique_univers: ThematiqueUnivers.cereales,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: false,
      thematique_univers: ThematiqueUnivers.gaspillage_alimentaire,
    });

    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      label: `Les céréales c'est bon`,
      image_url: 'aaaa',
      niveau: 2,
      univers_parent: Univers.alimentation,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.gaspillage_alimentaire,
      label: `jette pas !!`,
      image_url: 'bbb',
      niveau: 2,
      univers_parent: Univers.alimentation,
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(1);
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - ajout mission correcte avec articles taggué`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      titre: 'haha',
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
        content_id: '1',
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
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(4);
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('222');
    expect(userDB.missions.missions[0].objectifs[1].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[2].titre).toEqual('hoho');
    expect(userDB.missions.missions[0].objectifs[3].content_id).toEqual('0');
    expect(userDB.missions.missions[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.missions[0].objectifs[3].titre).toEqual('haha');
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - ajout Zero article tagué si aucun trouvé`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
    });

    const objectifs: ObjectifDefinition[] = [
      {
        content_id: null,
        points: 5,
        titre: 'TTT',
        type: ContentType.article,
        tag_article: 'truc',
        id_cms: null,
      },
    ];
    const mission_articles_tag: Mission = {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
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
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(0);
  });

  it(`GET /utilisateurs/id/univers/id/thematiques - ajout  article tagué exclu pour cause de code postal`, async () => {
    // GIVEN
    const logement_palaiseau: Logement_v0 = {
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
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      codes_postaux: ['91120'],
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      codes_postaux: ['75002'],
    });

    const objectifs: ObjectifDefinition[] = [
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
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, {
      missions: {},
      logement: logement_palaiseau,
    });

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
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs[0].content_id).toEqual('0');
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - ajout article par ordre de reco`, async () => {
    // GIVEN
    await TestUtil.create(DB.article, {
      content_id: '0',
      tag_article: 'composter',
      categorie: Categorie.mission,
      tags_utilisateur: [TagUtilisateur.viande_addict],
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      tag_article: 'composter',
      categorie: Categorie.mission,
      tags_utilisateur: [TagUtilisateur.capacite_physique],
    });
    await TestUtil.create(DB.article, {
      content_id: '2',
      tag_article: 'composter',
      categorie: Categorie.mission,
      tags_utilisateur: [TagUtilisateur.possede_voiture],
    });
    await TestUtil.create(DB.article, {
      content_id: '3',
      tag_article: 'composter',
      categorie: Categorie.mission,
      tags_utilisateur: [TagUtilisateur.possede_maison],
    });

    const objectifs: ObjectifDefinition[] = [
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
      code: 'code',
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      objectifs: objectifs as any,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, {
      missions: {},
      tag_ponderation_set: {
        capacite_physique: 10,
        possede_voiture: 20,
        viande_addict: 30,
        possede_maison: 0,
      },
    });

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
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.missions).toHaveLength(1);
    expect(userDB.missions.missions[0].objectifs).toHaveLength(4);
    expect(userDB.missions.missions[0].objectifs[0].content_id).toEqual('0');
    expect(userDB.missions.missions[0].objectifs[1].content_id).toEqual('2');
    expect(userDB.missions.missions[0].objectifs[2].content_id).toEqual('1');
    expect(userDB.missions.missions[0].objectifs[3].content_id).toEqual('3');
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste les thematiques dans le bon ordre`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: sept_missions,
    });
    await TestUtil.create(DB.univers, {
      code: Univers.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: 'A',
      univers_parent: Univers.alimentation,
      famille_id_cms: 1,
      famille_ordre: 2,
      niveau: 1,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: 'B',
      univers_parent: Univers.alimentation,
      famille_id_cms: 1,
      famille_ordre: 2,
      niveau: 3,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 3,
      code: 'C',
      univers_parent: Univers.alimentation,
      famille_id_cms: 1,
      famille_ordre: 2,
      niveau: 2,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 5,
      code: 'E',
      univers_parent: Univers.alimentation,
      famille_id_cms: 2,
      famille_ordre: 1,
      niveau: 2,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 4,
      code: 'D',
      univers_parent: Univers.alimentation,
      famille_id_cms: 2,
      famille_ordre: 1,
      niveau: 1,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 6,
      code: 'F',
      univers_parent: Univers.alimentation,
      famille_id_cms: -1,
      famille_ordre: 999,
      niveau: null,
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 7,
      code: 'G',
      univers_parent: Univers.alimentation,
      famille_id_cms: -1,
      famille_ordre: 999,
      niveau: null,
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(7);
    expect(response.body[0].type).toBe('D');
    expect(response.body[1].type).toBe('E');
    expect(response.body[2].type).toBe('A');
    expect(response.body[3].type).toBe('C');
    expect(response.body[4].type).toBe('B');
  });

  it(`GET /utilisateurs/id/univers/id/thematiques - ne liste pas une mission non visible, source histo`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_visible_pas_visible,
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'cereales !',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.dechets_compost,
      univers_parent: Univers.alimentation,
      label: 'dechets_compost',
      image_url: 'bbbb',
    });
    await ThematiqueRepository.resetAllRefs();
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].titre).toEqual('cereales !');
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste les missions visibles dans le catalogue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: {},
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
      label: 'cereales',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 2,
      code: ThematiqueUnivers.dechets_compost,
      univers_parent: Univers.alimentation,
      label: 'dechets compost',
      image_url: 'bbbb',
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: false,
      thematique_univers: ThematiqueUnivers.cereales,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: true,
      thematique_univers: ThematiqueUnivers.dechets_compost,
    });
    await ThematiqueRepository.resetAllRefs();
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].titre).toEqual('dechets compost');
  });

  it(`GET /utilisateurs/id/thematiques_recommandees - renvoie la liste des thematiques recommandées pour l'utilisateur, premiere thematique de chaque univers`, async () => {
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
      thematique_univers: ThematiqueUnivers.cereales,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      thematique_univers: ThematiqueUnivers.coming_soon,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 3,
      thematique_univers: ThematiqueUnivers.partir_vacances,
      thematique: Thematique.logement,
    });
    await thematiqueRepository.onApplicationBootstrap();
    await missionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques_recommandees',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].titre).toEqual('cereales');
    expect(response.body[1].titre).toEqual('partir_vacances');
  });

  it(`GET /utilisateurs/id/thematiques_recommandees - une tuile terminée n'apparaît pas`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: mission_unique_done });

    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.alimentation,
      label: 'Faut manger !',
    });
    await TestUtil.create(DB.thematiqueUnivers, {
      id_cms: 1,
      label: 'cereales',
      code: ThematiqueUnivers.cereales,
      univers_parent: Univers.alimentation,
    });

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
    });
    await missionRepository.onApplicationBootstrap();
    await thematiqueRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques_recommandees',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
});
