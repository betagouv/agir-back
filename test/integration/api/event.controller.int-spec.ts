import { EventType } from '../../../src/domain/appEvent';
import { DB, TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { UnlockedFeatures_v1 } from '../../../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import {
  Celebration,
  CelebrationType,
} from '../../../src/domain/gamification/celebrations/celebration';
import { Gamification } from '../../../src/domain/gamification/gamification';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { CodeMission } from '../../../src/domain/thematique/codeMission';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { MissionsUtilisateur_v1 } from '../../../src/domain/object_store/mission/MissionsUtilisateur_v1';

describe('EVENT (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  const missions_article: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        is_first: false,
        objectifs: [
          {
            id: '0',
            content_id: '1',
            type: ContentType.article,
            titre: 'Un article à lire',
            points: 20,
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
  const missions_quizz: MissionsUtilisateur_v1 = {
    version: 1,
    missions: [
      {
        id: '1',
        done_at: new Date(1),
        code: CodeMission.cereales,
        image_url: 'image',
        thematique: Thematique.alimentation,
        titre: 'titre',
        is_first: false,
        objectifs: [
          {
            id: '0',
            content_id: '1',
            type: ContentType.quizz,
            titre: 'Un quizz à faire',
            points: 25,
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

  it('POST /utilisateurs/id/event ok', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'something',
    });

    // THEN
    expect(response.status).toBe(201);
  });

  it('POST /utilisateurs/id/event - ajoute un historique de quizz v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '123',
      number_value: 55,
    });
    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts,
    ).toHaveLength(1);
    expect(
      dbUtilisateur.history
        .getQuizzHistoryById('123')
        .attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(55);
  });

  it('POST /utilisateurs/id/event - valide un quizz par content_id v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, {
      content_id: '123',
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '123',
      number_value: 100,
    });
    // THEN
    expect(response.status).toBe(201);

    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts,
    ).toHaveLength(1);
    expect(
      dbUtilisateur.history
        .getQuizzHistoryById('123')
        .attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(100);
  });

  it('POST /utilisateurs/id/events - valide objectif de mission article', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      missions: missions_article,
    });
    await TestUtil.create(DB.article, {
      content_id: '1',
      points: 5,
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
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(15);
    expect(
      dbUtilisateur.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeLessThan(Date.now());
  });
  it('POST /utilisateurs/id/events - valide objectif de mission quizz', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      version: 2,
      missions: missions_quizz,
    });
    await TestUtil.create(DB.quizz, {
      content_id: '1',
      points: 5,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      number_value: 100,
      content_id: '1',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(15);
    expect(
      dbUtilisateur.missions.missions[0].objectifs[0].done_at.getTime(),
    ).toBeLessThan(Date.now());
  });

  it('POST /utilisateurs/id/events - ajoute points pour article lu v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.article, {
      content_id: '123',
      points: 20,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
    expect(dbUtilisateur.points_classement).toStrictEqual(30);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').points_en_poche,
    ).toStrictEqual(true);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').read_date.getTime(),
    ).toBeGreaterThan(Date.now() - 150);
  });

  it('POST /utilisateurs/id/events - ajoute points pour article lu par content_id, user v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.article, {
      content_id: '123',
      points: 20,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').points_en_poche,
    ).toStrictEqual(true);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').read_date.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
  });

  it('POST /utilisateurs/id/events - ajoute pas deux fois points pour article lu v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.article, {
      content_id: '123',
      points: 20,
    });
    // WHEN
    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: EventType.article_lu,
      content_id: '123',
    });
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
  });
  it('POST /utilisateurs/id/events - supprime une celebration', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.celebration,
      celebration_id: 'celebration-id',
    });
    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['celebrations']).toHaveLength(0);
  });
  it('POST /utilisateurs/id/events - celebration consommée ajoute une fonctionnalité débloquée', async () => {
    // GIVEN
    const celeb = new Celebration({
      id: '1',
      titre: 'yo',
      type: CelebrationType.niveau,
      new_niveau: 2,
      reveal: Gamification.getRevealByNiveau(2),
    });
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [],
    };
    await TestUtil.create(DB.utilisateur, {
      gamification: { points: 10, celebrations: [celeb] },
      unlocked_features: unlocked,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.celebration,
      celebration_id: celeb.id,
    });

    // THEN
    expect(response.status).toBe(201);
    const dbUtilisateur = await utilisateurRepository.getById(
      'utilisateur-id',
      [Scope.ALL],
    );
    expect(dbUtilisateur.gamification.celebrations).toHaveLength(0);
    expect(dbUtilisateur.unlocked_features.getUnlockedFeatures()).toHaveLength(
      1,
    );
    expect(dbUtilisateur.unlocked_features.getUnlockedFeatures()[0]).toEqual(
      'aides',
    );
  });

  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.article, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.like,
      content_id: '123',
      number_value: 3,
      content_type: 'article',
    });

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.getArticleHistoryById('123').like_level).toEqual(3);
  });

  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction par type et content_id && history sur article v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, {
      content_id: '123',
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.like,
      content_id: '123',
      content_type: 'quizz',
      number_value: 3,
    });

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.getQuizzHistoryById('123').like_level).toEqual(3);
  });
  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction par type et content_id && history sur article v2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { version: 2 });
    await TestUtil.create(DB.quizz, {
      content_id: '123',
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.like,
      content_id: '123',
      content_type: 'quizz',
      number_value: 3,
    });

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.getQuizzHistoryById('123').like_level).toEqual(3);
  });
  it('POST /utilisateurs/id/events - favoris event set un favoris sur un article', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.article, { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_favoris,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.getArticleHistoryById('123').favoris).toEqual(true);
  });
  it('POST /utilisateurs/id/events - supprime un favoris sur un article', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      history: {
        article_interactions: [
          {
            content_id: '123',
            like_level: 2,
            points_en_poche: true,
            favoris: true,
          },
        ],
      },
    });
    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.getArticleHistoryById('123').favoris).toEqual(true);
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_non_favoris,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(201);
    userDB = await utilisateurRepository.getById('utilisateur-id', [Scope.ALL]);
    expect(userDB.history.getArticleHistoryById('123').favoris).toEqual(false);
  });
});
