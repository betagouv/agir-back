import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { Thematique } from '../../../src/domain/thematique';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';
import { TodoRepository } from '../../../src/infrastructure/repository/todo.repository';

describe('TODO list (API test)', () => {
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

  it('GET /utilisateurs/id/todo retourne la todo liste courante seule', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.points_todo).toEqual(25);
    expect(response.body.todo[0].id.length).toBeGreaterThan(12);
    expect(response.body.todo[0].titre).toEqual(
      'Faire un premier quizz climat - facile',
    );
    expect(response.body.todo[0].progression).toEqual({
      current: 0,
      target: 1,
    });
    expect(response.body.todo[0].sont_points_en_poche).toEqual(false);
    expect(response.body.todo[0].type).toEqual('quizz');
    expect(response.body.todo[0].points).toEqual(10);
    expect(response.body.todo[0].thematiques).toEqual(['climat']);
  });
  it('GET /utilisateurs/id/todo retourne la todo n°1 avec une ref de quizz qui va bien : thematique  climat', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      todo: {
        numero_todo: 1,
        points_todo: 25,
        done: [],
        todo: [
          {
            titre: 'faire quizz climat',
            thematiques: [Thematique.climat],
            progression: { current: 0, target: 1 },
            sont_points_en_poche: false,
            type: 'quizz',
            quizz_level: DifficultyLevel.L1,
            points: 10,
          },
        ],
      },
    });
    await TestUtil.create('interaction', {
      id: '1',
      content_id: 'quizz-id-l1',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L1,
      type: InteractionType.quizz,
    });
    await TestUtil.create('interaction', {
      id: '2',
      content_id: 'quizz-id-l2',
      thematique_gamification: Thematique.climat,
      difficulty: DifficultyLevel.L2,
      type: InteractionType.quizz,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.numero_todo).toEqual(1);
    expect(response.body.todo[0].type).toEqual(InteractionType.quizz);
    expect(response.body.todo[0].content_id).toEqual('quizz-id-l1');
    expect(response.body.todo[0].interaction_id).toEqual('1');
  });
  it('POST /utilisateurs/id/todo/id/earn_points encaissse les points associé à cet élément', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      points: 11,
      todo: {
        numero_todo: 1,
        points_todo: 25,
        todo: [],
        done: [
          {
            id: '123',
            titre: 'Faire un premier quizz climat - facile',
            thematiques: [Thematique.climat],
            progression: { current: 1, target: 1 },
            sont_points_en_poche: false,
            type: InteractionType.quizz,
            quizz_level: DifficultyLevel.L1,
            points: 10,
          },
        ],
      },
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/earn_points',
    );

    // THEN
    expect(response.status).toBe(200);
    const todoDB = await todoRepository.getUtilisateurTodo('utilisateur-id');
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(todoDB.done[0].sont_points_en_poche).toEqual(true);
    expect(dbUtilisateur.points).toEqual(21);
  });
  it('POST /utilisateurs/id/todo/id/earn_points encaissse les points qu une seule fois ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      points: 11,
      todo: {
        numero_todo: 1,
        points_todo: 25,
        todo: [],
        done: [
          {
            id: '123',
            titre: 'Faire un premier quizz climat - facile',
            thematiques: [Thematique.climat],
            progression: { current: 1, target: 1 },
            sont_points_en_poche: false,
            type: InteractionType.quizz,
            quizz_level: DifficultyLevel.L1,
            points: 10,
          },
        ],
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/earn_points',
    );
    expect(response.status).toBe(200);
    response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/earn_points',
    );
    expect(response.status).toBe(200);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.points).toEqual(21);
  });
  it('POST /utilisateurs/id/todo/id/earn_points encaissse pas les points d un truc pas fait ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
      points: 11,
      todo: {
        numero_todo: 1,
        points_todo: 25,
        done: [],
        todo: [
          {
            id: '123',
            titre: 'Faire un premier quizz climat - facile',
            thematiques: [Thematique.climat],
            progression: { current: 0, target: 1 },
            sont_points_en_poche: false,
            type: InteractionType.quizz,
            quizz_level: DifficultyLevel.L1,
            points: 10,
          },
        ],
      },
    });

    // WHEN
    let response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/todo/123/earn_points',
    );
    expect(response.status).toBe(200);

    // THEN
    const dbUtilisateur = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUtilisateur.points).toEqual(11);
  });
});
