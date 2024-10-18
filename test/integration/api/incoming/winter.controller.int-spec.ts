import { DB, TestUtil } from '../../../TestUtil';

const INCOMMING_DATA = {
  ok: true,
  sent_on: '2023-12-04T16:00:16.796375+00:00',
  info: {
    prm: 'abc',
    data_type: 'energy',
    unit: 'kWh',
    enedis_reading_date: '2023-12-04',
    processed_on: '2023-12-04T16:00:16.796386+00:00',
  },
  data: [
    {
      date: '2023-12-16',
      value_cumulee: null,
    },
    {
      date: '2023-12-17',
      value_cumulee: null,
    },
    {
      date: '2023-12-18',
      value_cumulee: null,
    },
    {
      date: '2023-12-19',
      value_cumulee: null,
    },
    {
      date: '2023-12-20',
      value_cumulee: null,
    },
  ],
};
describe('/api/incoming/winter-energies (API test)', () => {
  const OLD_ENV = process.env;
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    TestUtil.token = process.env.CMS_WEBHOOK_API_KEY;
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.WINTER_API_KEY = '123456789';
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('POST /api/incoming/winter-energies - 200 par défaut append des valeurs', async () => {
    // GIVEN
    await TestUtil.create(DB.linky);
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/winter-energies')
      .set('key', process.env.WINTER_API_KEY)
      .send(INCOMMING_DATA);

    // THEN
    expect(response.status).toBe(201);
    const dbData = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(dbData.data).toHaveLength(7);
  });
  it('POST /api/incoming/winter-energies - creation entree si pas de prm deja connu', async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/winter-energies')
      .set('key', process.env.WINTER_API_KEY)
      .send(INCOMMING_DATA);

    // THEN
    expect(response.status).toBe(201);
    const dbData = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(dbData.data).toHaveLength(5);
  });
  it('POST /api/incoming/winter-energies - erreur 401 si mauvaise clé API', async () => {
    // GIVEN
    await TestUtil.create(DB.linky);
    // WHEN
    const response = await TestUtil.getServer()
      .post('/api/incoming/winter-energies')
      .send(INCOMMING_DATA);

    // THEN
    expect(response.status).toBe(401);
  });
});
