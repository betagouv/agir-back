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
    expect(response.body.todo[0].content_id).toEqual(null);
    expect(response.body.todo[0].points).toEqual(10);
    expect(response.body.todo[0].thematiques).toEqual(['climat']);
  });
});
