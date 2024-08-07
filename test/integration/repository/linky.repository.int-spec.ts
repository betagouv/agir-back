import { DB, TestUtil } from '../../TestUtil';
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
    await TestUtil.create(DB.linky);
    // WHEN
    const result = await linkyRepository.getByPRM('abc');
    // THEN
    expect(result.serie[0].date.getTime()).toBeLessThan(Date.now());
    expect(result.serie[0].day_value).toEqual(100);
  });
  it('create data', async () => {
    // GIVEN
    const new_data = new LinkyData({
      prm: 'abc',
      serie: [
        {
          date: new Date(1000),
          day_value: 50,
          value_cumulee: null,
        },
      ],
      utilisateurId: '123',
    });

    // WHEN
    await linkyRepository.upsertDataForPRM('abc', [
      {
        date: new Date(1000),
        day_value: 50,
        value_cumulee: null,
      },
    ]);

    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.data).toHaveLength(1);
    expect(prm.data[0].date).toEqual(new Date(1000).toISOString());
    expect(prm.data[0].day_value).toEqual(50);
  });
  it('upsertLinkyEntry create', async () => {
    // WHEN
    await linkyRepository.upsertLinkyEntry('abc', 'def', '123');

    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.utilisateurId).toEqual('123');
    expect(prm.winter_pk).toEqual('def');
    expect(prm.data).toHaveLength(0);
  });
  it('upsertLinkyEntry update', async () => {
    // GIVEN
    await linkyRepository.upsertLinkyEntry('abc', 'def', '123');

    // WHEN
    await linkyRepository.upsertLinkyEntry('abc', 'GHJ', '456');

    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.utilisateurId).toEqual('456');
    expect(prm.winter_pk).toEqual('GHJ');
    expect(prm.data).toHaveLength(0);
  });
  it('update data', async () => {
    // GIVEN
    await TestUtil.create(DB.linky);

    // WHEN
    await linkyRepository.upsertDataForPRM('abc', [
      {
        date: new Date(1000),
        day_value: 50,
        value_cumulee: null,
      },
    ]);
    // THEN
    const prm = await TestUtil.prisma.linky.findUnique({
      where: { prm: 'abc' },
    });
    expect(prm.data).toHaveLength(1);
    expect(prm.utilisateurId).toEqual('utilisateur-id'); // pas de maj de user ID !
    expect(prm.winter_pk).toEqual('123'); // pas de maj de user ID !
    expect(prm.data[0].date).toEqual(new Date(1000).toISOString());
    expect(prm.data[0].day_value).toEqual(50);
  });
  it('delete all', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      prm: 'p1',
      utilisateurId: '1',
      winter_pk: '1',
    });
    await TestUtil.create(DB.linky, {
      prm: 'p2',
      utilisateurId: '2',
      winter_pk: '2',
    });
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
    await TestUtil.create(DB.linky, {
      prm: 'p1',
      utilisateurId: '12',
      winter_pk: '1',
    });
    await TestUtil.create(DB.linky, {
      prm: 'p2',
      utilisateurId: undefined,
      winter_pk: '2',
    });
    await TestUtil.create(DB.linky, {
      prm: 'p3',
      utilisateurId: '45',
      winter_pk: '3',
    });
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
    await TestUtil.create(DB.linky, { prm: '123', data: [] });

    // WHEN
    const result = await linkyRepository.isPRMDataEmptyOrMissing('123');

    // THEN
    expect(result).toEqual(true);
  });
  it('isPRMDataEmptyOrMissing: some data => false', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, { prm: '123' });

    // WHEN
    const result = await linkyRepository.isPRMDataEmptyOrMissing('123');

    // THEN
    expect(result).toEqual(false);
  });
  it('findOrphanEntries: retrieve lost PRMs', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      prm: '000',
      utilisateurId: null,
      winter_pk: '000',
    });
    await TestUtil.create(DB.linky, {
      prm: '123',
      utilisateurId: null,
      winter_pk: '111',
    });
    await TestUtil.create(DB.linky, {
      prm: '456',
      utilisateurId: '1',
      winter_pk: '222',
    });
    await TestUtil.create(DB.linky, {
      prm: '789',
      utilisateurId: '2',
      winter_pk: 'abc',
    });
    await TestUtil.create(DB.linky, {
      prm: '999',
      utilisateurId: '3',
      winter_pk: null,
    });

    await TestUtil.create(DB.utilisateur, { id: '1' });

    // WHEN
    const result = await linkyRepository.findWinterPKsOrphanEntries();

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0].prm).toEqual('789');
    expect(result[0].winter_pk).toEqual('abc');
    expect(result[0].utilisateurId).toEqual('2');
  });
});
