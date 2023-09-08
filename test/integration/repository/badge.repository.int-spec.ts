import { TestUtil } from '../../TestUtil';
import { BadgeRepository } from '../../../src/infrastructure/repository/badge.repository';
import { BadgeTypes } from '../../../src/domain/badge/badgeTypes';

describe('BadgeRepository', () => {
  let badgeRepository = new BadgeRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Creates a new badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    await badgeRepository.createUniqueBadge(
      'utilisateur-id',
      BadgeTypes.premier_quizz,
    );
    // THEN
    const badges = await TestUtil.prisma.badge.findMany({});
    expect(badges).toHaveLength(1);
  });
  it('Creates a new badge once only', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    await badgeRepository.createUniqueBadge(
      'utilisateur-id',
      BadgeTypes.premier_quizz,
    );
    await badgeRepository.createUniqueBadge(
      'utilisateur-id',
      BadgeTypes.premier_quizz,
    );
    // THEN
    const badges = await TestUtil.prisma.badge.findMany({});
    expect(badges).toHaveLength(1);
  });
  it('Creates two badges for different users of same type', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { id: '1', email: 'aa' });
    await TestUtil.create('utilisateur', { id: '2', email: 'bb' });
    // WHEN
    await badgeRepository.createUniqueBadge('1', BadgeTypes.premier_quizz);
    await badgeRepository.createUniqueBadge('2', BadgeTypes.premier_quizz);
    // THEN
    const badges = await TestUtil.prisma.badge.findMany({});
    expect(badges).toHaveLength(2);
  });
});
