import { DB, TestUtil } from '../../TestUtil';
import { ThematiqueUnivers } from '../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { MissionsUtilisateur_v0 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { Univers } from '../../../src/domain/univers/univers';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
  KYCID,
  BooleanKYC,
} from '../../../src/domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { EventType } from '../../../src/domain/appEvent';
import { DefiStatus } from '../../../src/domain/defis/defi';

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

  const missions_defi_seul: MissionsUtilisateur_v0 = {
    version: 0,
    missions: [
      {
        id: '1',
        done_at: null,
        thematique_univers: ThematiqueUnivers.cereales,
        objectifs: [
          {
            id: '0',
            content_id: '0',
            type: ContentType.defi,
            titre: '1 defi',
            points: 10,
            is_locked: false,
            done_at: new Date(),
          },
          {
            id: '1',
            content_id: '1',
            type: ContentType.defi,
            titre: '1 defi',
            points: 10,
            is_locked: false,
            done_at: null,
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
    expect(objectif.titre).toEqual('Super article');
    expect(objectif.points).toEqual(10);
    expect(objectif.is_locked).toEqual(true);
    expect(objectif.done_at).toEqual(new Date(0).toISOString());
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
      categorie: CategorieQuestionKYC.mission,
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
      categorie: CategorieQuestionKYC.default,
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
      categorie: CategorieQuestionKYC.default,
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
    expect(response.body.categorie).toEqual(CategorieQuestionKYC.default);
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
      categorie: CategorieQuestionKYC.default,
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
      categorie: CategorieQuestionKYC.default,
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
    expect(response.body[0].content_id).toEqual('_3');
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
      categorie: CategorieQuestionKYC.default,
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
      categorie: CategorieQuestionKYC.default,
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
  it(`GET /utilisateurs/:utilisateurId/thematiques/:thematique/mission - ajout mission si dernier defi réalisé`, async () => {
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
