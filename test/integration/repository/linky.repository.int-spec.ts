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
    const linky_data = new LinkyData({
      prm: 'prm-123',
      pk_winter: '1234',
      serie: [],
    });
    // WHEN
    await linkyRepository.createNewLinky(linky_data);
    // THEN
    const prms = await TestUtil.prisma.linky.findMany({});
    expect(prms).toHaveLength(1);
    expect(prms[0].prm).toEqual('prm-123');
    expect(prms[0].pk_winter).toEqual('1234');
    expect(prms[0].data).toEqual([]);
  });
  it('get data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    // WHEN
    const result = await linkyRepository.getLinky('abc');
    // THEN
    expect(result.serie[0].time.getTime()).toBeLessThan(Date.now());
    expect(result.serie[0].value).toEqual(100);
    expect(result.serie[0].value_at_normal_temperature).toEqual(110);
  });
  it('update data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    const new_data = new LinkyData({
      pk_winter: '1234',
      prm: 'abc',
      serie: [
        {
          time: new Date(1000),
          value: 50,
          value_at_normal_temperature: 55,
        },
      ],
    });
    // WHEN
    await linkyRepository.updateData(new_data);
    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.data).toHaveLength(1);
    expect(prm.data[0].time).toEqual(new Date(1000).toISOString());
    expect(prm.data[0].value).toEqual(50);
    expect(prm.data[0].value_at_normal_temperature).toEqual(55);
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
    expect(prm.data).toHaveLength(0);
  });
  it('delete all', async () => {
    // GIVEN
    await TestUtil.create('linky', { id: '1', pk_winter: 'a', prm: 'p1' });
    await TestUtil.create('linky', { id: '2', pk_winter: 'b', prm: 'p2' });
    // WHEN
    await linkyRepository.deleteLinky('p2');
    // THEN
    const prm_a = await TestUtil.prisma.linky.findUnique({
      where: { id: '1' },
    });
    const prm_b = await TestUtil.prisma.linky.findUnique({
      where: { id: '2' },
    });
    expect(prm_a).not.toBeNull();
    expect(prm_b).toBeNull();
  });
});
