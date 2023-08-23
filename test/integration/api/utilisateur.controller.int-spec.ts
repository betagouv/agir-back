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
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs?name=bob');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs?name=george - by name when present', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs?name=george',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('2');
  });

  it('GET /utilisateurs/id - when missing', async () => {
    // THEN
    return TestUtil.getServer().get('/utilisateurs/1').expect(404);
  });
  it('GET /utilisateurs/id - when present', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('utilisateur-id');
    expect(response.body.name).toEqual('name');
    expect(response.body.points).toEqual(0);
    expect(response.body.quizzLevels).toEqual({
      alimentation: 1,
      transport: 2,
    });
    expect(response.body.created_at).toEqual(dbUser.created_at.toISOString());
  });
  it('GET /utilisateurs/id - list 1 badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(1);
    expect(response.body.badges[0].titre).toEqual('titre');
    expect(response.body.badges[0].created_at).toBeDefined();
  });
  it('GET /utilisateurs/id - list 2 badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    await TestUtil.create('badge', { id: '2', type: 'type2', titre: 'titre2' });
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(2);
  });

  it('GET /utilisateurs - list all 2', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs - create new utilisateur with given name', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      name: 'george',
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { name: 'george' },
    });
    expect(response.status).toBe(201);
    expect(response.body.name).toEqual('george');
    expect(response.headers['location']).toContain(user.id);
  });
});
