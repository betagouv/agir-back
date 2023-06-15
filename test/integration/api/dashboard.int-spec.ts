import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
const commons = require('../../test-commons');

describe('/dashboard (API test)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await commons.appinit();
  });

  beforeEach(async () => {
    await commons.deleteAll();
  })

  afterAll(async () => {
    await commons.appclose();
  })

  it('GET /dashboard/name - get a dashboard of a given user', async () => {
    await commons.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const response = await request(app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toHaveLength(0);
    expect(response.body.quizz).toHaveLength(0);
    expect(response.body.badges).toHaveLength(0);
  });

  it('GET /dashboard/name - get a dashboard with proper compteur', async () => {
    await commons.prisma.utilisateur.create({
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
    const response = await request(app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toHaveLength(1);
  });

  it('GET /dashboard/name - get a dashboard of a missing user', async () => {
    const response = await request(app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(404);
  });

});
