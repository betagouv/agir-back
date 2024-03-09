import { DB, TestUtil } from '../../TestUtil';
import { GroupeRepository } from '../../../src/infrastructure/repository/groupe.repository';

describe('GroupeRepository', () => {
  let groupeRepository = new GroupeRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('isAdmin : check ok IS admin of groupe', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.groupe);
    await TestUtil.create(DB.groupeAbonnement);

    // WHEN
    const result = await groupeRepository.isAdminOfGroupe(
      'utilisateur-id',
      'groupe-id',
    );

    // THEN
    expect(result).toEqual(true);
  });
  it('isAdmin : check ok is NOT admin of groupe', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.groupe);
    await TestUtil.create(DB.groupeAbonnement, { admin: false });

    // WHEN
    const result = await groupeRepository.isAdminOfGroupe(
      'utilisateur-id',
      'groupe-id',
    );

    // THEN
    expect(result).toEqual(false);
  });
  it('isAdmin : check ok is NOT admin of groupe when not even in group', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.groupe);

    // WHEN
    const result = await groupeRepository.isAdminOfGroupe(
      'utilisateur-id',
      'groupe-id',
    );

    // THEN
    expect(result).toEqual(false);
  });
  it('isAdmin : check ok is NOT admin of groupe when even no group', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const result = await groupeRepository.isAdminOfGroupe(
      'utilisateur-id',
      'groupe-id',
    );

    // THEN
    expect(result).toEqual(false);
  });
});
