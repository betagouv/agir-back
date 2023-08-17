import { TestUtil } from '../../TestUtil';

describe('/bilan (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateur/id/bilans/last - get last bilan with proper data', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('situationNGC');
    await TestUtil.create('empreinte');

    const response = await TestUtil.getServer().get(
      '/utilisateur/utilisateur-id/bilans/last',
    );
    expect(response.status).toBe(200);
    expect(response.body.details).toStrictEqual({
      divers: 852.8584599753638,
      logement: 1424.3853917865213,
      transport: 2533.9706912924553,
      alimentation: 2033.7441687666667,
      services_societaux: 1553.6358095597056,
    });
    expect(response.body.bilan_carbone_annuel).toStrictEqual(8398.594521380714);
  });
  it('GET /utilisateur/id/bilans/last - get last bilan by id user', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('situationNGC', { id: 'id1' });
    await TestUtil.create('situationNGC', { id: 'id2' });
    await TestUtil.create('empreinte', {
      id: '1',
      created_at: new Date(0),
      situationId: 'id1',
    });
    await TestUtil.create('empreinte', {
      id: '2',
      created_at: new Date(100),
      situationId: 'id2',
    });

    const response = await TestUtil.getServer().get(
      '/utilisateur/utilisateur-id/bilans/last',
    );
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('2');
  });
  it('GET /utilisateur/id/bilans - get list of bilans', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('situationNGC', { id: 'id1' });
    await TestUtil.create('situationNGC', { id: 'id2' });
    await TestUtil.create('empreinte', {
      id: '1',
      created_at: new Date(0),
      situationId: 'id1',
    });
    await TestUtil.create('empreinte', {
      id: '2',
      created_at: new Date(100),
      situationId: 'id2',
    });

    const response = await TestUtil.getServer().get(
      '/utilisateur/utilisateur-id/bilans',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].id).toBe('2');
    expect(response.body[1].id).toBe('1');
  });
  it('POST /utilisateur/id/bilans - compute and create new Bilan', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('situationNGC');

    // WHEN
    const response = await TestUtil.getServer().post(
      '/utilisateurs/utilisateur-id/bilans/situationNGC-id',
    );

    //THEN
    expect(response.status).toBe(201);

    const bilanDB = await TestUtil.prisma.empreinte.findMany({
      include: { situation: true },
    });
    expect(bilanDB).toHaveLength(1);
    expect(bilanDB[0]['situation'].situation).toStrictEqual({
      'transport . voiture . km': 12000,
    });
    expect(bilanDB[0].bilan['details']).toStrictEqual({
      divers: 852.8584599753638,
      logement: 1424.3853917865213,
      transport: 2533.9706912924553,
      alimentation: 2033.7441687666667,
      services_societaux: 1553.6358095597056,
    });
  });
  it('POST /bilan/importFromNGC - creates new situation', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .send({
        situation: {
          'transport . voiture . km': 12000,
        },
      });

    //THEN
    expect(response.status).toBe(201);

    const situationDB = await TestUtil.prisma.situationNGC.findMany({});
    expect(situationDB).toHaveLength(1);
    expect(situationDB[0].situation).toStrictEqual({
      'transport . voiture . km': 12000,
    });
  });
});
