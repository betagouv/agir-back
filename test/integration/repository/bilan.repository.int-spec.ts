import { TestUtil } from '../../TestUtil';
import { BilanRepository } from '../../../src/infrastructure/repository/bilan.repository';

describe('BilanRepository', () => {
  let bilanRepository = new BilanRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Get null situation when  a new badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const lastSituation = await bilanRepository.getLastSituationbyUtilisateurId(
      'utilisateur-id',
    );

    // THEN
    expect(lastSituation).toBeUndefined();
  });
});
