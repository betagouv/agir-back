import { DB, TestUtil } from '../../TestUtil';

describe('/bilan (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateur/id/bilans/last - 403 if bad id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.empreinte);

    // WHEN
    const response = await TestUtil.GET('/utilisateur/autre-id/bilans/last');

    //THEN
    expect(response.status).toBe(403);
  });
  it('GET /utilisateur/id/bilans/last - get last bilan with proper data', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.empreinte);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);

    expect(Math.floor(response.body.details.divers)).toStrictEqual(852);
    expect(Math.floor(response.body.details.logement)).toStrictEqual(1424);
    expect(Math.floor(response.body.details.transport)).toStrictEqual(2533);
    expect(Math.floor(response.body.details.alimentation)).toStrictEqual(2033);
    expect(Math.floor(response.body.details.services_societaux)).toStrictEqual(
      1553,
    );
    expect(response.body.bilan_carbone_annuel).toStrictEqual(8398.594521380714);
  });
  it('GET /utilisateur/id/bilans/last - get last bilan by id user', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC, { id: 'id1' });
    await TestUtil.create(DB.situationNGC, { id: 'id2' });
    await TestUtil.create(DB.empreinte, {
      id: '1',
      created_at: new Date(0),
      situationId: 'id1',
    });
    await TestUtil.create(DB.empreinte, {
      id: '2',
      created_at: new Date(100),
      situationId: 'id2',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateur/utilisateur-id/bilans/last',
    );

    //THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('2');
  });
  it('GET /utilisateur/id/bilans - get list of bilans', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC, { id: 'id1' });
    await TestUtil.create(DB.situationNGC, { id: 'id2' });
    await TestUtil.create(DB.empreinte, {
      id: '1',
      created_at: new Date(0),
      situationId: 'id1',
    });
    await TestUtil.create(DB.empreinte, {
      id: '2',
      created_at: new Date(100),
      situationId: 'id2',
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateur/utilisateur-id/bilans');

    //THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].id).toBe('2');
    expect(response.body[1].id).toBe('1');
  });
  it('POST /utilisateur/id/bilans - compute and create new Bilan', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);

    // WHEN
    const response = await TestUtil.POST(
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
    expect(Math.floor(bilanDB[0].bilan['details'].divers)).toStrictEqual(1079);
    expect(Math.floor(bilanDB[0].bilan['details'].logement)).toStrictEqual(
      1477,
    );
    expect(Math.floor(bilanDB[0].bilan['details'].transport)).toStrictEqual(
      2760,
    );
    expect(Math.floor(bilanDB[0].bilan['details'].alimentation)).toStrictEqual(
      2094,
    );
    expect(
      Math.floor(bilanDB[0].bilan['details'].services_societaux),
    ).toStrictEqual(1450);
  });
  it('POST /bilan/importFromNGC - creates new situation', async () => {
    // WHEN
    const response = await TestUtil.POST('/bilan/importFromNGC').send({
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
