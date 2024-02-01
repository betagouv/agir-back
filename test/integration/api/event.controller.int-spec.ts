import { EventType } from '../../../src/domain/utilisateur/utilisateurEvent';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/thematique';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { CelebrationDeNiveau } from '../../../src/domain/gamification/celebrations/celebrationDeNiveau';
import { UnlockedFeatures } from '../../../src/domain/gamification/unlockedFeatures';

describe('EVENT (API test)', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: 'something',
    });

    // THEN
    expect(response.status).toBe(200);
  });

  it('POST /utilisateurs/id/event - ajoute un historique de quizz v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '123',
      number_value: 55,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts,
    ).toHaveLength(1);
    expect(
      dbUtilisateur.history
        .getQuizzHistoryById('123')
        .attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(55);
  });

  it('POST /utilisateurs/id/event - valide un quizz par content_id v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', {
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
    expect(response.status).toBe(200);

    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts,
    ).toHaveLength(1);
    expect(
      dbUtilisateur.history
        .getQuizzHistoryById('123')
        .attempts[0].date.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
    expect(
      dbUtilisateur.history.getQuizzHistoryById('123').attempts[0].score,
    ).toEqual(100);
  });

  it('POST /utilisateurs/id/events - increase todo element progression and moves to done v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id',
      points: 20,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 100,
    });
    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(
      userDB.parcours_todo.getActiveTodo().done[0].progression.current,
    ).toEqual(1);
  });
  it('POST /utilisateurs/id/events - NOT increase todo element progression when not 100% v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id',
      points: 20,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 50,
    });
    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(
      userDB.parcours_todo.getActiveTodo().todo[0].progression.current,
    ).toEqual(0);
  });

  it('POST /utilisateurs/id/events - does not add points when points en poche v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      version: 2,
      history: {
        quizz_interactions: [
          {
            content_id: '123',
            like_level: 2,
            points_en_poche: true,
          },
        ],
      },
    });
    await TestUtil.create('quizz', {
      content_id: '123',
      points: 20,
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
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toStrictEqual(10);
  });

  it('POST /utilisateurs/id/events - does not add points twice on quizz v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', { content_id: 'quizz-id', points: 5 });
    // WHEN
    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 100,
    });

    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 100,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toStrictEqual(15);
  });

  it('POST /utilisateurs/id/events - does not add points when not 100% quizz v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', { content_id: '123' });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '123',
      number_value: 79,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toStrictEqual(10);
  });

  it('POST /utilisateurs/id/events - saves score at 0 properly, v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', {
      content_id: 'quizz-id',
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 0,
    });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(
      userDB.history.getQuizzHistoryById('quizz-id').attempts[0].score,
    ).toEqual(0);
  });

  it('POST /utilisateurs/id/events - ajoute points pour article lu v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('article', {
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
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').points_en_poche,
    ).toStrictEqual(true);
    expect(
      dbUtilisateur.history.getArticleHistoryById('123').read_date.getTime(),
    ).toBeGreaterThan(Date.now() - 150);
  });

  it('POST /utilisateurs/id/events - ajoute points pour article lu par content_id, user v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('article', { content_id: '123', points: 20 });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: '123',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
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
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('article', {
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
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
  });
  it('POST /utilisateurs/id/events - supprime une celebration', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.celebration,
      celebration_id: 'celebration-id',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['celebrations']).toHaveLength(0);
  });
  it('POST /utilisateurs/id/events - celebration consommée ajoute une fonctionnalité débloquée', async () => {
    // GIVEN
    const celeb = new CelebrationDeNiveau(2);
    await TestUtil.create('utilisateur', {
      gamification: { points: 10, celebrations: [celeb] },
      unlocked_features: new UnlockedFeatures(),
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.celebration,
      celebration_id: celeb.id,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUtilisateur.gamification.celebrations).toHaveLength(0);
    expect(dbUtilisateur.unlocked_features.getUnlockedList()).toHaveLength(1);
    expect(dbUtilisateur.unlocked_features.getUnlockedList()[0]).toEqual(
      'aides',
    );
  });

  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('article', { content_id: '123' });
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
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(userDB.history.getArticleHistoryById('123').like_level).toEqual(3);
  });

  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction par type et content_id && history sur article v2', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 2 });
    await TestUtil.create('quizz', {
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
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(userDB.history.getQuizzHistoryById('123').like_level).toEqual(3);
  });
});
