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

  it('GET /utilisateurs - when missing name', async () => {
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  
  });
  it('GET /utilisateurs - by name when present', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    })
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({id: '1', name: 'bob'});
  });

  it('GET /utilisateurs/id - when missing', async () => {
    return request(TestUtil.app.getHttpServer())
      .get('/utilisateurs/1')
      .expect(404);
  });
  it('GET /utilisateurs/id - when present', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs/1');
    expect(response.status).toBe(200);
    expect([response.body]).toContainEqual({id: '1', name: 'bob'});
  });

  it('GET /utilisateurs - list all 2', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: "bob" },
        { id: '2', name: "george" }
      ],
    })
    const response = await request(TestUtil.app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

});
