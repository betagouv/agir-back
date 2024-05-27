import { DB, TestUtil } from '../../TestUtil';
import { Univers } from '../../../src/domain/univers/univers';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';

describe('Univers (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const mission_unique: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
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
          },
        ],
        prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
        est_visible: true,
      },
      {
        id: '2',
        done_at: null,
        thematique_univers: ThematiqueUnivers.dechets_compost,
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
      is_locked: false,
      reason_locked: null,
      titre: 'yo',
      type: Univers.climat,
      image_url: 'aaaa',
    });
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
      niveau: null,
      image_url: 'aaaa',
      univers_parent: Univers.alimentation,
      univers_parent_label: 'Manger !',
    });
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
