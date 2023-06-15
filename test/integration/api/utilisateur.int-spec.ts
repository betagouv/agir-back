import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const commons = require('../../test-commons');

describe('/utilisateurs (API test)', () => {
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

  it('GET /utilisateurs - when missing name', async () => {
    const response = await request(app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  
  });
  it('GET /utilisateurs - by name when present', async () => {
    await commons.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    })
    const response = await request(app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({id: '1', name: 'bob'});
  });

  it('GET /utilisateurs/id - when missing', async () => {
    return request(app.getHttpServer())
      .get('/utilisateurs/1')
      .expect(404);
  });
  it('GET /utilisateurs/id - when present', async () => {
    await commons.prisma.utilisateur.createMany({
      data: [{ id: '1', name: "bob" }],
    });
    const response = await request(app.getHttpServer()).get('/utilisateurs/1');
    expect(response.status).toBe(200);
    expect([response.body]).toContainEqual({id: '1', name: 'bob'});
  });

  it('GET /utilisateurs - list all 2', async () => {
    await commons.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: "bob" },
        { id: '2', name: "george" }
      ],
    })
    const response = await request(app.getHttpServer()).get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs - created with given id', async () => {
    const response = await request(app.getHttpServer()).post('/utilisateurs').send({ id: '123', name: "toto" });
    expect(response.status).toBe(201);
    const dbdata = await commons.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata).toContainEqual({ id: '123', name: "toto" })
  });

  it('POST /utilisateurs - created with no id', async () => {
    const response = await request(app.getHttpServer()).post('/utilisateurs').send({ name: "toto" });
    expect(response.status).toBe(201);
    const dbdata = await commons.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata[0].name).toEqual( "toto");
    expect(dbdata[0].id).toHaveLength(36); // UUID V4
  });

  it('POST /utilisateurs - exception when id already in use', async () => {
    await commons.prisma.utilisateur.createMany({
      data: [{ id: '123', name: "roger" }],
    });
    const response = await request(app.getHttpServer()).post('/utilisateurs').send({ id: '123', name: "toto" });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Un utilisateur d'id 123 existe déjà en base");
    const dbdata = await commons.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata[0].name).toEqual( "roger");
    expect(dbdata[0].id).toEqual('123');
  });

});
