import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/questionsNGC (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('PUT /utilisateurs/id/questionsNGC - creates an new entry', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer()
      .put('/utilisateurs/utilisateur-id/questionsNGC')
      .send({
        key: '123',
        value: '456',
      });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.key).toEqual('123');
    expect(response.body.value).toEqual('456');
    expect(response.body.id).toBeDefined();
    const questionsNGC = await TestUtil.prisma.questionNGC.findMany({});
    expect(questionsNGC).toHaveLength(1);
  });
});
