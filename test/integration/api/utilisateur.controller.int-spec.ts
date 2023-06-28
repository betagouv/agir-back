import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/utilisateurs (API test)', () => {

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('GET /utilisateurs?name=bob - when missing name', async () => {
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(202);
    expect(response.body).toHaveLength(0);
  });
  it.only('GET /utilisateurs?name=george - by name when present', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: "bob" },
        { id: '2', name: "george" }
      ],
    })
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs?name=george');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual("2");
  });

  it('GET /utilisateurs/id - when missing', async () => {
    return request(TestUtil.app.getHttpServer())
      .get('/utilisateurs/1')
      .expect(404);
  });
  it('GET /utilisateurs/id - when present', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: "bob" },
        { id: '2', name: "george" }
      ],
    })
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs/1');
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual("1");
  });

  it('GET /utilisateurs - list all 2', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: "bob" },
        { id: '2', name: "george" }
      ],
    })
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

});
