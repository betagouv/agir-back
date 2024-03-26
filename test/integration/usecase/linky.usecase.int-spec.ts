import { DB, TestUtil } from '../../TestUtil';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';
import { LinkyRepository } from '../../../src/infrastructure/repository/linky.repository';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';

describe('linkyUsecase', () => {
  let serviceRepository = new ServiceRepository(TestUtil.prisma);
  let linkyRepository = new LinkyRepository(TestUtil.prisma);
  let linkyAPIConnector = {
    souscription_API: jest.fn(),
    deleteSouscription: jest.fn(),
  };

  let linkyUsecase = new LinkyUsecase(
    linkyRepository,
    serviceRepository,
    linkyAPIConnector,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    linkyAPIConnector.deleteSouscription.mockReset();
    linkyAPIConnector.souscription_API.mockReset();

    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('unsubscribeOrphanPRMs : empty result when nothing in DB', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const result = await linkyUsecase.unsubscribeOrphanPRMs();

    // THEN
    expect(result).toHaveLength(0);
    expect(linkyAPIConnector.deleteSouscription).toBeCalledTimes(0);
  });
  it('unsubscribeOrphanPRMs : delete one OK', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      utilisateurId: '123',
      prm: 'abc',
      winter_pk: '345',
    });

    // WHEN
    const result = await linkyUsecase.unsubscribeOrphanPRMs();

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('DELETED');
    expect(result[0]).toContain('abc');
    expect(result[0]).toContain('123');
    expect(result[0]).toContain('345');
    expect(linkyAPIConnector.deleteSouscription).toBeCalledWith('345');

    const linkys = await linkyRepository.getAllPRMs();
    expect(linkys).toHaveLength(0);
  });
  it('unsubscribeOrphanPRMs : delete 2 OK', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      utilisateurId: '123',
      prm: '111',
      winter_pk: 'abc',
    });
    await TestUtil.create(DB.linky, {
      utilisateurId: '456',
      prm: '222',
      winter_pk: 'def',
    });

    // WHEN
    const result = await linkyUsecase.unsubscribeOrphanPRMs();

    // THEN
    expect(result).toHaveLength(2);
    expect(result[0]).toContain('DELETED');
    expect(result[1]).toContain('DELETED');
    expect(linkyAPIConnector.deleteSouscription).toBeCalledTimes(2);

    const linkys = await linkyRepository.getAllPRMs();
    expect(linkys).toHaveLength(0);
  });
  it('unsubscribeOrphanPRMs : unknown error', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      utilisateurId: '123',
      prm: '111',
      winter_pk: 'abc',
    });
    linkyAPIConnector.deleteSouscription.mockImplementation(() => {
      throw { code: '11', message: 'aie' };
    });

    // WHEN
    const result = await linkyUsecase.unsubscribeOrphanPRMs();

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('ERROR');
    expect(result[0]).toContain('11');
    expect(result[0]).toContain('aie');

    const linkys = await linkyRepository.getAllPRMs();
    expect(linkys).toHaveLength(1);
  });
  it('unsubscribeOrphanPRMs : 037 error', async () => {
    // GIVEN
    await TestUtil.create(DB.linky, {
      utilisateurId: '123',
      prm: '111',
      winter_pk: 'abc',
    });
    linkyAPIConnector.deleteSouscription.mockImplementation(() => {
      throw { code: '037', message: 'aie' };
    });

    // WHEN
    const result = await linkyUsecase.unsubscribeOrphanPRMs();

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('ALREADY');
    expect(result[0]).toContain('123');
    expect(result[0]).toContain('111');
    expect(result[0]).toContain('abc');

    const linkys = await linkyRepository.getAllPRMs();
    expect(linkys).toHaveLength(0);
  });
});
