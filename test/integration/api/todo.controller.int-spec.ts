import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { Thematique } from '../../../src/domain/thematique';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { TestUtil } from '../../TestUtil';

describe('TODO list (API test)', () => {
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
});
