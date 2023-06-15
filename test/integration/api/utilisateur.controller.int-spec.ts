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

  it('POST /utilisateurs - created with given id', async () => {
    const response = await request(TestUtil.app.getHttpServer()).post('/utilisateurs').send({ id: '123', name: "toto" });
    expect(response.status).toBe(201);
    const dbdata = await TestUtil.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata).toContainEqual({ id: '123', name: "toto" })
  });

  it('POST /utilisateurs - created with no id', async () => {
    const response = await request(TestUtil.app.getHttpServer()).post('/utilisateurs').send({ name: "toto" });
    expect(response.status).toBe(201);
    const dbdata = await TestUtil.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata[0].name).toEqual( "toto");
    expect(dbdata[0].id).toHaveLength(36); // UUID V4
  });

  it('POST /utilisateurs - exception when id already in use', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [{ id: '123', name: "roger" }],
    });
    const response = await request(TestUtil.app.getHttpServer()).post('/utilisateurs').send({ id: '123', name: "toto" });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Un utilisateur d'id 123 existe déjà en base");
    const dbdata = await TestUtil.prisma.utilisateur.findMany({});
    expect(dbdata).toHaveLength(1);
    expect(dbdata[0].name).toEqual( "roger");
    expect(dbdata[0].id).toEqual('123');
  });

});
