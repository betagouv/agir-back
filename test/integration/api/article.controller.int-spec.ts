import { TestUtil } from '../../TestUtil';

describe('/articles (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /articles/id - get an articles by id', async () => {
    // GIVEN
    await TestUtil.create('article');
    // WHEN
    const response = await TestUtil.getServer().get('/articles/article-id');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.title).toEqual('titre');
    expect(response.body.content).toEqual('<html>Hello World !!</html>');
  });
});
