import { BadgeTypes } from '../../../src/domain/badge/badgeTypes';
import { EventType } from '../../../src/domain/utilisateur/utilisateurEvent';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import { Thematique } from '../../../src/domain/thematique';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { TodoRepository } from '../../../src/infrastructure/repository/todo.repository';

describe('EVENT (API test)', () => {
  let todoRepository = new TodoRepository(TestUtil.prisma);

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

  it('POST /utilisateurs/id/event - win badge when first quizz score present', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', { type: InteractionType.quizz });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      interaction_id: 'interaction-id',
      number_value: 55,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
      include: {
        badges: true,
      },
    });
    expect(dbUtilisateur['badges']).toHaveLength(1);
    expect(dbUtilisateur['badges'][0].type).toEqual(
      BadgeTypes.premier_quizz.type,
    );
  });

  it('POST /utilisateurs/id/events - increase thematique level when 100% success condition and win badge and add points', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { points: 10 });
    await TestUtil.create('interaction', {
      id: '1',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 85,
      done: true,
      done_at: new Date(1),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '2',
      type: InteractionType.quizz,
      difficulty: 1,
      quizz_score: 90,
      done: true,
      done_at: new Date(100),
      thematique_gamification: Thematique.climat,
    });
    await TestUtil.create('interaction', {
      id: '3',
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
      interaction_id: '3',
      number_value: 100,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const dbBadges = await TestUtil.prisma.badge.findMany({
      orderBy: {
        created_at: 'asc',
      },
    });
    expect(dbUtilisateur.quizzLevels['climat'].level).toStrictEqual(
      DifficultyLevel.L2,
    );
    expect(dbUtilisateur.points).toEqual(30);
    expect(dbBadges.length).toEqual(2);
    expect(dbBadges[0].titre).toStrictEqual('1er quizz réussi !');
    expect(dbBadges[1].titre).toStrictEqual(
      'Passage quizz niveau 2 en catégorie climat !!',
    );
    expect(dbBadges[1].type).toStrictEqual('climat_1');
  });

  it('POST /utilisateurs/id/events - increase todo element progression and moves to done', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { points: 10 });
    await TestUtil.create('interaction', {
      id: '3',
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
      interaction_id: '3',
      number_value: 100,
    });
    // THEN
    expect(response.status).toBe(200);
    const todo = await todoRepository.getUtilisateurTodo('utilisateur-id');
    expect(todo.done[0].progression.current).toEqual(1);
  });

  it('POST /utilisateurs/id/events - does not add points when already done', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('interaction', {
      done: true,
    });
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/events',
    ).send({
      type: EventType.quizz_score,
      interaction_id: 'interaction-id',
      number_value: 79,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.points).toStrictEqual(0);
  });
});
