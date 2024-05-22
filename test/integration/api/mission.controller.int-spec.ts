import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Univers } from '../../../src/domain/univers/univers';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
} from '../../../src/domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { EventType } from '../../../src/domain/appEvent';

describe('Mission (API test)', () => {
  const thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);

  const missions: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        thematique_univers: ThematiqueUnivers.cereales,
        objectifs: [
          {
            id: '0',
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '1',
            content_id: '13',
            type: ContentType.article,
            titre: 'Super article',
            points: 10,
            is_locked: true,
            done_at: new Date(0),
          },
          {
            id: '2',
            content_id: '14',
            type: ContentType.quizz,
            titre: 'Super quizz',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '3',
            content_id: '2',
            type: ContentType.defi,
            titre: 'Action à faire',
            points: 10,
            is_locked: true,
            done_at: null,
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
        objectifs: [
          {
            id: '0',
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: new Date(),
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
        objectifs: [
          {
            id: '0',
            content_id: '_3',
            type: ContentType.kyc,
            titre: '1 question pour vous',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '1',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
            points: 10,
            is_locked: true,
            done_at: null,
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
        objectifs: [
          {
            id: '0',
            content_id: '1',
            type: ContentType.article,
            titre: '1 article',
            points: 10,
            is_locked: false,
            done_at: null,
          },
          {
            id: '1',
            content_id: '1',
            type: ContentType.defi,
            titre: '1 défi',
            points: 10,
            is_locked: true,
            done_at: null,
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
          },
        ],
        prochaines_thematiques: [],
        est_visible: false,
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

  it(`GET /utilisateurs/id/thematiques/climat/mission - renvoie la mission de la thématique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
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
    expect(response.body.id).toEqual('1');
    expect(response.body.is_new).toEqual(false);
    expect(response.body.progression).toEqual({ current: 1, target: 4 });
    expect(response.body.thematique_univers).toEqual('cereales');
    expect(response.body.thematique_univers_label).toEqual(
      'Mange de la graine',
    );
    expect(response.body.univers_label).toEqual('Faut manger !');
    expect(response.body.done_at).toEqual(new Date(1).toISOString());
    expect(response.body.objectifs).toHaveLength(4);

    const item_2 = response.body.objectifs[1];
    expect(item_2.id).toEqual('1');
    expect(item_2.content_id).toEqual('13');
    expect(item_2.type).toEqual(ContentType.article);
    expect(item_2.titre).toEqual('Super article');
    expect(item_2.points).toEqual(10);
    expect(item_2.is_locked).toEqual(true);
    expect(item_2.done_at).toEqual(new Date(0).toISOString());
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie la prochaine question à poser`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.default);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie la prochaine question à poser`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('_3');
    expect(response.body.type).toEqual(TypeReponseQuestionKYC.choix_unique);
    expect(response.body.points).toEqual(10);
    expect(response.body.reponses_possibles).toEqual(['Oui', 'Non', 'A voir']);
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.default);
    expect(response.body.question).toEqual(
      `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    );
  });
  it(`GET /utilisateurs/id/missions/:missionId/next_kyc - renvoie 404 si plus de kyc à faire`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { missions: missions_kyc_done });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - un article débloqué suite à la réalisation de la KYC`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      missions: missions_kyc_plus_article,
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
      '/utilisateurs/utilisateur-id/missions/1/next_kyc',
    );

    // THEN
    expect(response.status).toBe(404);
  });
});
