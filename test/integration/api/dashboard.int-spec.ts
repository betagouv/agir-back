import * as request from 'supertest';
import { TestUtil } from '../../TestUtil';

describe('/dashboard (API test)', () => {

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('GET /dashboard/name - get a dashboard of a given user', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const response = await request(TestUtil.app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toHaveLength(0);
    expect(response.body.quizz).toHaveLength(0);
    expect(response.body.badges).toHaveLength(0);
  });

  it('GET /dashboard/name - get a dashboard with proper compteur', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {
         id: '1', name: "bob",
         compteurs: {
           create: [
             {
              id: "1" ,
              titre: "thetitre",
               valeur: "89",
             }
           ]
         }
        }
    });
    const response = await request(TestUtil.app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toHaveLength(1);
  });

  it('GET /dashboard/name - get a dashboard of a missing user', async () => {
    const response = await request(TestUtil.app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(404);
  });

});
