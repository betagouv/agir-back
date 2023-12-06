import { TestUtil } from '../../TestUtil';
import { LinkyRepository } from '../../../src/infrastructure/repository/linky.repository';
import { LinkyData } from '../../../src/domain/linky/linkyData';

describe('LinkyRepository', () => {
  let linkyRepository = new LinkyRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Creates a new entry', async () => {
    // GIVEN
    // WHEN
    await linkyRepository.createNewPRM('prm-123');
    // THEN
    const prms = await TestUtil.prisma.linky.findMany({});
    expect(prms).toHaveLength(1);
    expect(prms[0].prm).toEqual('prm-123');
    expect(prms[0].data['serie']).toEqual([]);
  });
  it('get  data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    // WHEN
    const result = await linkyRepository.getData('abc');
    // THEN
    expect(result.serie[0].time.getTime()).toBeLessThan(Date.now());
    expect(result.serie[0].value).toEqual(100);
    expect(result.serie[0].value_at_normal_temperature).toEqual(110);
  });
  it('update  data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    const new_data = new LinkyData({
      serie: [
        {
          time: new Date(1000),
          value: 50,
          value_at_normal_temperature: 55,
        },
      ],
    });
    // WHEN
    await linkyRepository.updateData('abc', new_data);
    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    const linky_data = new LinkyData(prm.data as any);
    expect(linky_data.serie).toHaveLength(1);
    expect(linky_data.serie[0].time).toEqual(new Date(1000));
    expect(linky_data.serie[0].value).toEqual(50);
    expect(linky_data.serie[0].value_at_normal_temperature).toEqual(55);
  });
  it('empty  data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    // WHEN
    await linkyRepository.emptyData('abc');
    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    const linky_data = new LinkyData(prm.data as any);
    expect(linky_data.serie).toHaveLength(0);
  });
});
