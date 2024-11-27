import { DB, TestUtil } from '../../TestUtil';
import { CodeMission } from '../../../src/domain/thematique/codeMission';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
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
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';

describe('Univers (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const missionRepository = new MissionRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  const sept_missions: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
        code: 'A',
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
        code: 'B',
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
        code: 'C',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
        code: 'D',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
        code: 'E',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
        code: 'F',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
        code: 'G',
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
  const mission_unique: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
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
      },
    ],
  };
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
      },
    ],
  };

  const missions_visible_pas_visible: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: null,
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
        code: CodeMission.dechets_compost,
        image_url: 'img',
        thematique: Thematique.alimentation,
        titre: 'titre',
        introduction: 'intro',
        is_first: false,
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
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.climat,
      label: 'yo',
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 2,
      code: Thematique.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
  });
  it(`GET /utilisateurs/id/univers - liste les univers de l'utilisateur, is_done à true`, async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 3;

    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique_done,
      todo: todo,
    });
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await thematiqueRepository.loadThematiques();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
  });

  it(`GET /utilisateurs/id/univers/id/thematiques - liste une thematique, donnée correctes, ajout mission à utilisateur si visible`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: true,
      code: CodeMission.cereales,
      thematique: Thematique.alimentation,
      image_url: 'aaaa',
      titre: "Les céréales c'est bon",
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: true,
      code: CodeMission.gaspillage_alimentaire,
      thematique: Thematique.alimentation,
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
      type: CodeMission.cereales,
      progression: 1,
      cible_progression: 2,
      is_locked: false,
      reason_locked: null,
      is_new: false,
      image_url: 'aaaa',
      univers_parent: Thematique.alimentation,
      univers_parent_label: 'Manger !',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste une thematique, donnée correctes, NON ajout mission à utilisateur si PAS visible`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique,
    });
    await TestUtil.create(DB.thematique, {
      code: Thematique.alimentation,
      label: 'Manger !',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: true,
      code: CodeMission.cereales,
      thematique: Thematique.alimentation,
      titre: `Les céréales c'est bon`,
      image_url: 'aaaa',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: false,
      code: CodeMission.gaspillage_alimentaire,
      thematique: Thematique.alimentation,
      titre: `jette pas !!`,
      image_url: 'bbb',
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
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
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
      est_visible: true,
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
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].titre).toEqual(
      'hoho',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].content_id).toEqual(
      '0',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].type).toEqual(
      ContentType.article,
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].titre).toEqual(
      'haha',
    );
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
      est_visible: true,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      objectifs: objectifs as any,
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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(0);
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
      est_visible: true,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
      objectifs: objectifs as any,
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.utilisateur, {
      missions: {},
      logement: logement_palaiseau,
    });

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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs[0].content_id).toEqual(
      '0',
    );
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
      est_visible: true,
      code: CodeMission.cereales,
      image_url: 'img',
      thematique: Thematique.alimentation,
      titre: 'titre',
      introduction: 'intro',
      is_first: false,
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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.missions.getRAWMissions()).toHaveLength(1);
    expect(userDB.missions.getRAWMissions()[0].objectifs).toHaveLength(4);
    expect(userDB.missions.getRAWMissions()[0].objectifs[0].content_id).toEqual(
      '0',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[1].content_id).toEqual(
      '2',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[2].content_id).toEqual(
      '1',
    );
    expect(userDB.missions.getRAWMissions()[0].objectifs[3].content_id).toEqual(
      '3',
    );
  });

  it(`GET /utilisateurs/id/univers/id/thematiques - liste les missions visibles dans le catalogue`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: {},
    });
    await TestUtil.create(DB.article, { content_id: '1' });
    await TestUtil.create(DB.article, { content_id: '2' });
    await TestUtil.create(DB.thematique, {
      id_cms: 1,
      code: Thematique.alimentation,
      label: 'ya',
      image_url: 'bbbb',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 1,
      est_visible: false,
      code: CodeMission.cereales,
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      est_visible: true,
      code: CodeMission.dechets_compost,
      titre: 'dechets compost',
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
      code: CodeMission.cereales,
      thematique: Thematique.alimentation,
      titre: 'cereales',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 2,
      code: CodeMission.coming_soon,
      thematique: Thematique.alimentation,
      titre: 'coming_soon',
    });
    await TestUtil.create(DB.mission, {
      id_cms: 3,
      titre: 'partir_vacances',
      code: CodeMission.partir_vacances,
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

    await TestUtil.create(DB.mission, {
      id_cms: 1,
      code: CodeMission.cereales,
      thematique: Thematique.alimentation,
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
