import { TestUtil } from '../../TestUtil';

describe('StatistiqueRepository', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('lecture correcte dans la base de stats ', async () => {
    // GIVEN
    await TestUtil.prisma_stats.testTable.create({
      data: {
        id: '1',
        type: 'yo',
      },
    });
    // WHEN

    const liste = await TestUtil.prisma_stats.testTable.findMany();
    expect(liste).toHaveLength(1);
    expect(liste[0]).toEqual({
      id: '1',
      type: 'yo',
    });
  });
});
