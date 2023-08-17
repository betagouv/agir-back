import { TestUtil } from '../../TestUtil';

describe('/utilisateurs/id/questionsNGC (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('PUT /utilisateurs/id/questionsNGC - creates an new entry', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer()
      .put('/utilisateurs/utilisateur-id/questionsNGC')
      .send({
        key: 'transport . voiture . km',
        value: 12000,
      });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.key).toEqual('transport . voiture . km');
    expect(response.body.value).toEqual('12000');
    expect(response.body.id).toBeDefined();
    const questionsNGC = await TestUtil.prisma.questionNGC.findMany({});
    expect(questionsNGC).toHaveLength(1);
  });
  it('PUT /utilisateurs/id/questionsNGC - creates also a new Bilan', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const response = await TestUtil.getServer()
      .put('/utilisateurs/utilisateur-id/questionsNGC')
      .send({
        key: 'transport . voiture . km',
        value: 12000,
      });

    // THEN
    expect(response.status).toBe(200);

    const bilansDB = await TestUtil.prisma.empreinte.findMany({
      include: { situation: true },
    });
    expect(bilansDB).toHaveLength(1);
    expect(bilansDB[0].situation.situation).toStrictEqual({
      'transport . voiture . km': '12000',
    });
    expect(bilansDB[0].bilan['bilan_carbone_annuel']).toStrictEqual(
      8398.594521380714,
    );
    expect(bilansDB[0].bilan['details'].transport).toStrictEqual(
      2533.9706912924553,
    );
  });
  it('PUT /utilisateurs/id/questionsNGC - mix with previous bilan and previous question', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionNGC', {
      key: 'transport . avion . usager',
      value: 'non',
    });
    await TestUtil.create('situationNGC');
    await TestUtil.create('empreinte');

    // WHEN
    const response = await TestUtil.getServer()
      .put('/utilisateurs/utilisateur-id/questionsNGC')
      .send({
        key: 'transport . voiture . motorisation',
        value: "'électrique'",
      });

    // THEN
    expect(response.status).toBe(200);

    const bilansDB = await TestUtil.prisma.empreinte.findMany({
      include: { situation: true },
      orderBy: { created_at: 'desc' },
    });
    expect(bilansDB[0].situation.situation).toStrictEqual({
      'transport . voiture . km': 12000,
      'transport . voiture . motorisation': "'électrique'",
      'transport . avion . usager': 'non',
    });
  });
});
