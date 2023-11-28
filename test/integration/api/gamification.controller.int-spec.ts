import { TestUtil } from '../../TestUtil';

describe('Gamification  (API test)', () => {
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

  it('GET /utilisateurs/id/gamification retourne le nombre de points de l utilisateur ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { points: 25 });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.points).toEqual(25);
  });
  it('GET /utilisateurs/id/gamification retourne la liste de celebrations ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { points: 25 });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/gamification',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.celebrations).toHaveLength(1);
    expect(response.body.celebrations[0]).toEqual({
      id: 'celebration-id',
      type: 'niveau',
      new_niveau: 2,
    });
  });
});
