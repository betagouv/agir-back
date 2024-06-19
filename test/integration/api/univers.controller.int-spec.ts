import { DB, TestUtil } from '../../TestUtil';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { ParcoursTodo_v0 } from '../../../src/domain/object_store/parcoursTodo/parcoursTodo_v0';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';

describe('Univers (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const sept_missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: 'A',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        thematique_univers: 'B',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '3',
        done_at: new Date(),
        thematique_univers: 'C',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '4',
        done_at: null,
        thematique_univers: 'D',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '5',
        done_at: null,
        thematique_univers: 'E',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '6',
        done_at: null,
        thematique_univers: 'F',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
        est_visible: true,
      },
      {
        id: '7',
        done_at: null,
        thematique_univers: 'G',
        univers: 'alimentation',
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
        prochaines_thematiques: [],
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
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
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
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
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
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        thematique_univers: ThematiqueUnivers.dechets_compost,
        univers: 'alimentation',
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
        prochaines_thematiques: [],
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
      is_locked: false,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
      is_locked: false,
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toEqual({
      etoiles: 0,
      is_locked: true,
      reason_locked: null,
      titre: 'yo',
      type: Univers.climat,
      image_url: 'aaaa',
      is_done: false,
    });
    expect(response.body[1].is_locked).toEqual(true);
  });
  it(`GET /utilisateurs/id/univers - liste les univers de l'utilisateur, todo terminée => unlock, sauf les locked dans le CMS`, async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 3;

    await TestUtil.create(DB.utilisateur, { todo: todo });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'yo',
      image_url: 'aaaa',
      is_locked: false,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
      is_locked: true,
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].type).toEqual(Univers.climat);
    expect(response.body[0].is_locked).toEqual(false);
    expect(response.body[1].type).toEqual(Univers.alimentation);
    expect(response.body[1].is_locked).toEqual(true);
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
  it(`GET /utilisateurs/id/univers - univers bloqué en dernier`, async () => {
    // GIVEN
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());
    todo.todo_active = 3;

    await TestUtil.create(DB.utilisateur, { todo: todo });
    await TestUtil.create(DB.univers, {
      id_cms: 1,
      code: Univers.climat,
      label: 'yo',
      image_url: 'aaaa',
      is_locked: false,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 2,
      code: Univers.alimentation,
      label: 'ya',
      image_url: 'bbbb',
      is_locked: true,
    });
    await TestUtil.create(DB.univers, {
      id_cms: 3,
      code: Univers.dechet,
      label: 'yi',
      image_url: 'cccc',
      is_locked: false,
    });
    await thematiqueRepository.loadUnivers();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/univers');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].titre).toEqual('yo');
    expect(response.body[0].is_locked).toEqual(false);
    expect(response.body[1].titre).toEqual('yi');
    expect(response.body[1].is_locked).toEqual(false);
    expect(response.body[2].titre).toEqual('ya');
    expect(response.body[2].is_locked).toEqual(true);
  });
  it(`GET /utilisateurs/id/univers/id/thematiques - liste une thematique, donnée correctes`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: mission_unique,
    });
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toEqual({
      titre: `Les céréales c'est bon`,
      type: ThematiqueUnivers.cereales,
      progression: 1,
      cible_progression: 1,
      is_locked: false,
      reason_locked: null,
      is_new: false,
      niveau: 2,
      image_url: 'aaaa',
      univers_parent: Univers.alimentation,
      univers_parent_label: 'Manger !',
    });
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
    expect(response.body[0].titre).toEqual('cereales !');
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
    await ThematiqueRepository.resetAllRefs();
    await thematiqueRepository.onApplicationBootstrap();
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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/univers/alimentation/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].titre).toEqual('dechets compost');
  });
});
