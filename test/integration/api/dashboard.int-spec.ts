import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
const commons = require('../../test-commons');

describe('/dashboard (API test)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await commons.appinit();
  });

  beforeEach(async () => {
    await commons.prisma.utilisateur.deleteMany();
  })

  afterAll(async () => {
    await commons.appclose();
  })

  it('GET /dashboard/name - get a dashboard of a given user', async () => {
    await commons.db().utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const response = await request(app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(200);
    expect(response.body.compteurs).toBeDefined();
    expect(response.body.quizz).toBeDefined();
    expect(response.body.badges).toBeDefined();
  });

  it('GET /dashboard/name - get a dashboard of a missing user', async () => {
    const response = await request(app.getHttpServer()).get('/dashboard/bob');
    expect(response.status).toBe(404);
  });

});
