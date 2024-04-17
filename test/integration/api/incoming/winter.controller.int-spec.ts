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
      utc_timestamp: '2023-12-04T00:00:00+00:00',
      value: 0.33951590073077637,
      value_at_normal_temperature: 0.22355511897321267,
    },
    {
      utc_timestamp: '2023-12-04T01:00:00+00:00',
      value: 0.4583726714829544,
      value_at_normal_temperature: 0.30040729005714384,
    },
    {
      utc_timestamp: '2023-12-04T02:00:00+00:00',
      value: 0.22902165458585222,
      value_at_normal_temperature: 0.21865304225683613,
    },
    {
      utc_timestamp: '2023-12-04T03:00:00+00:00',
      value: 0.0697905506736527,
      value_at_normal_temperature: 0.16460693380557062,
    },
    {
      utc_timestamp: '2023-12-04T04:00:00+00:00',
      value: 0.4950439046116773,
      value_at_normal_temperature: 0.37340895862808376,
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
    jest.resetModules();
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
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Received OK !');
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
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Received OK !');
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
