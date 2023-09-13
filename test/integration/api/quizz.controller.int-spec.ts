import { TestUtil } from '../../TestUtil';

describe('/Quizz (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /quizz/id - get a quizz content by id', async () => {
    // GIVEN
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: 'quizzQuestion-id2' });
    // WHEN
    const response = await TestUtil.getServer().get('/quizz/quizz-id');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('titre');
    expect(response.body['questions']).toHaveLength(2);
    expect(response.body['questions'][0].solution).toBeDefined();
    expect(response.body['questions'][0].texte_riche_ko).toBeDefined();
    expect(response.body['questions'][0].texte_riche_explication).toBeDefined();
  });
});
