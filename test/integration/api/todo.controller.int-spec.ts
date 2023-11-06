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

  it('GET /utilisateurs/id retourne la todo liste courante parmi les infos utilisateur', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.todo.niveau).toEqual(1);
    expect(response.body.todo.elements[0].ordre).toEqual(1);
    expect(response.body.todo.elements[0].titre).toEqual('titre');
    expect(response.body.todo.elements[0].url).toEqual('/article/123');
    expect(response.body.todo.elements[0].done).toEqual(false);
    expect(response.body.todo.elements[0].thematiques).toEqual([
      'climat',
      'logement',
    ]);
  });
  it('GET /utilisateurs/id/todo retourne la todo liste courante seule', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/todo');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.niveau).toEqual(1);
    expect(response.body.elements[0].ordre).toEqual(1);
    expect(response.body.elements[0].titre).toEqual('titre');
    expect(response.body.elements[0].done).toEqual(false);
    expect(response.body.elements[0].url).toEqual('/article/123');
    expect(response.body.elements[0].thematiques).toEqual([
      'climat',
      'logement',
    ]);
  });
});
