import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/questions (API test)', () => {
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

  it.skip('GET /utilisateurs/id/questions/id', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questions/question-id',
    );

    // THEN
    expect(response.status).toBe(200);
  });
});
