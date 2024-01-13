import { EventType } from '../../../src/domain/utilisateur/utilisateurEvent';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
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
  it('POST /utilisateurs/id/event - valide un quizz par content_id v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      type: InteractionType.quizz,
      content_id: '123',
      done: false,
      points_en_poche: false,
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
    const dbInter = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInter.points_en_poche).toStrictEqual(true);
    expect(dbInter.done).toStrictEqual(true);
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

  it('POST /utilisateurs/id/events - increase thematique level when 100% success condition and win badge and add points', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      id: 'i1',
      content_id: '1',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 85,
      done: true,
      done_at: new Date(1),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: 'i2',
      content_id: '2',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 90,
      done: true,
      done_at: new Date(100),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: 'i3',
      content_id: '3',
      points: 20,
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: undefined,
      done: false,
      done_at: null,
      thematique_gamification: Thematique.climat,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: '3',
      number_value: 100,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.quizzLevels['climat'].level).toStrictEqual(
      DifficultyLevel.L2,
    );
    expect(dbUtilisateur.gamification['points']).toEqual(30);
  });

  it('POST /utilisateurs/id/events - increase todo element progression and moves to done v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      content_id: 'quizz-id',
      points: 20,
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: undefined,
      done: false,
      done_at: null,
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

  it('POST /utilisateurs/id/events - does not add points when points en poche v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      points_en_poche: true,
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
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toStrictEqual(10);
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
  it('POST /utilisateurs/id/events - does not add points twice on quizz v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction');
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
  it('POST /utilisateurs/id/events - does not add points when not 100% quizz v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      done: false,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      content_id: 'quizz-id',
      number_value: 79,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.gamification['points']).toStrictEqual(10);
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
  it('POST /utilisateurs/id/events - saves score at 0 properly, v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: null,
      done: false,
      done_at: null,
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
    const interaction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(interaction.done).toStrictEqual(true);
    expect(interaction.quizz_score).toStrictEqual(0);
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
  it('POST /utilisateurs/id/events - ajoute points pour article lu v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      done: false,
      type: InteractionType.article,
      points: 20,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: 'quizz-id',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    const dbInter = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);

    expect(dbInter.points_en_poche).toStrictEqual(true);
    expect(dbInter.done).toStrictEqual(true);
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
  it('POST /utilisateurs/id/events - ajoute points pour article lu par content_id, user v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      done: false,
      type: InteractionType.article,
      points: 20,
      content_id: '123',
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
    const dbInter = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
    expect(dbInter.points_en_poche).toStrictEqual(true);
    expect(dbInter.done).toStrictEqual(true);
    expect(dbUtilisateur.history.getArticleHistoryById('123')).toBeUndefined();
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
  it('POST /utilisateurs/id/events - ajoute pas deux fois points pour article lu v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      done: false,
      type: InteractionType.article,
      points: 20,
    });
    // WHEN
    await TestUtil.POST('/utilisateurs/utilisateur-id/events').send({
      type: EventType.article_lu,
      content_id: 'quizz-id',
    });
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.article_lu,
      content_id: 'quizz-id',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    expect(dbUtilisateur.gamification.points).toStrictEqual(30);
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
  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      type: 'article',
      content_id: '123',
    });
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
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.like_level).toEqual(3);
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
  it('POST /utilisateurs/id/events - like event set la valeur du like sur une interaction par type et content_id && history sur article v0', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { version: 0 });
    await TestUtil.create('interaction', {
      content_id: '123',
      type: InteractionType.quizz,
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
    const dbInteraction = await TestUtil.prisma.interaction.findUnique({
      where: { id: 'interaction-id' },
    });
    expect(dbInteraction.like_level).toEqual(3);
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
