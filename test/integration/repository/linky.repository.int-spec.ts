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

  it('get data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    // WHEN
    const result = await linkyRepository.getByPRM('abc');
    // THEN
    expect(result.serie[0].time.getTime()).toBeLessThan(Date.now());
    expect(result.serie[0].value).toEqual(100);
    expect(result.serie[0].value_at_normal_temperature).toEqual(110);
  });
  it('create data', async () => {
    // GIVEN
    const new_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date(1000),
          value: 50,
          value_at_normal_temperature: 55,
        },
      ],
      utilisateurId: '123',
    });

    // WHEN
    await linkyRepository.upsertData(new_data);

    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.data).toHaveLength(1);
    expect(prm.utilisateurId).toEqual('123');
    expect(prm.data[0].time).toEqual(new Date(1000).toISOString());
    expect(prm.data[0].value).toEqual(50);
    expect(prm.data[0].value_at_normal_temperature).toEqual(55);
  });
  it('update data', async () => {
    // GIVEN
    await TestUtil.create('linky');
    const new_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          time: new Date(1000),
          value: 50,
          value_at_normal_temperature: 55,
        },
      ],
      utilisateurId: '123',
    });
    // WHEN
    await linkyRepository.upsertData(new_data);
    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.data).toHaveLength(1);
    expect(prm.utilisateurId).toEqual('utilisateur-id'); // pas de maj de user ID !
    expect(prm.data[0].time).toEqual(new Date(1000).toISOString());
    expect(prm.data[0].value).toEqual(50);
    expect(prm.data[0].value_at_normal_temperature).toEqual(55);
  });
  it('delete all', async () => {
    // GIVEN
    await TestUtil.create('linky', { prm: 'p1', utilisateurId: '1' });
    await TestUtil.create('linky', { prm: 'p2', utilisateurId: '2' });
    // WHEN
    await linkyRepository.delete('p2');
    // THEN
    const prm_a = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'p1' },
    });
    const prm_b = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'p2' },
    });
    expect(prm_a).not.toBeNull();
    expect(prm_b).toBeNull();
  });
  it('delete by user id', async () => {
    // GIVEN
    await TestUtil.create('linky', { prm: 'p1', utilisateurId: '12' });
    await TestUtil.create('linky', { prm: 'p2', utilisateurId: undefined });
    await TestUtil.create('linky', { prm: 'p3', utilisateurId: '45' });
    // WHEN
    await linkyRepository.deleteOfUtilisateur('12');
    // THEN
    const prm_a = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'p1' },
    });
    const prm_b = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'p2' },
    });
    const prm_c = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'p3' },
    });
    expect(prm_a).toBeNull();
    expect(prm_b).not.toBeNull();
    expect(prm_c).not.toBeNull();
  });
  it('isPRMDataEmptyOrMissing: no PRM => true', async () => {
    // GIVEN

    // WHEN
    const result = await linkyRepository.isPRMDataEmptyOrMissing('123');

    // THEN
    expect(result).toEqual(true);
  });
  it('isPRMDataEmptyOrMissing: empty Data => true', async () => {
    // GIVEN
    await TestUtil.create('linky', { prm: '123', data: [] });

    // WHEN
    const result = await linkyRepository.isPRMDataEmptyOrMissing('123');

    // THEN
    expect(result).toEqual(true);
  });
  it('isPRMDataEmptyOrMissing: some data => false', async () => {
    // GIVEN
    await TestUtil.create('linky', { prm: '123' });

    // WHEN
    const result = await linkyRepository.isPRMDataEmptyOrMissing('123');

    // THEN
    expect(result).toEqual(false);
  });
});
