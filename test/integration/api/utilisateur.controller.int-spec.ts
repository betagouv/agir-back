import { TestUtil } from '../../TestUtil';

describe('/utilisateurs (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs?name=bob - when missing name', async () => {
    const response = await TestUtil.getServer().get('/utilisateurs?name=bob');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs?name=george - by name when present', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    const response = await TestUtil.getServer().get(
      '/utilisateurs?name=george',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('2');
  });

  it('GET /utilisateurs/id - when missing', async () => {
    return TestUtil.getServer().get('/utilisateurs/1').expect(404);
  });
  it('GET /utilisateurs/id - when present', async () => {
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('utilisateur-id');
    expect(response.body.name).toEqual('name');
    expect(response.body.points).toEqual(0);
    expect(response.body.created_at).toEqual(dbUser.created_at.toISOString());
  });
  it('GET /utilisateurs/id - list 1 badge', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(1);
    expect(response.body.badges[0].titre).toEqual('titre');
    expect(response.body.badges[0].created_at).toBeDefined();
  });
  it('GET /utilisateurs/id - list 2 badge', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    await TestUtil.create('badge', { id: '2', type: 'type2', titre: 'titre2' });
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(2);
  });

  it('GET /utilisateurs - list all 2', async () => {
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    const response = await TestUtil.getServer().get('/utilisateurs');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs - create new utilisateur with given name', async () => {
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      name: 'george',
    });
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { name: 'george' },
    });
    expect(response.status).toBe(201);
    expect(response.body.name).toEqual('george');
    expect(response.headers['location']).toContain(user.id);
  });
});
