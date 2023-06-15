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

  it('GET /dashboard/name - get a dashboard with proper quizz', async () => {
    await TestUtil.prisma.utilisateur.create({
      data: {id: '1', name: "bob"}
    });
    await TestUtil.prisma.quizz.create({
      data: {id: "1", titre: "The Quizz !"}
    })
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
      ]
    });
    const response = await request(TestUtil.app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.quizz).toHaveLength(1);
    expect(response.body.quizz[0]["questions"]).toHaveLength(2);
  });

  it('GET /dashboard/name - get a dashboard of a missing user', async () => {
    const response = await request(TestUtil.app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(404);
  });

});
