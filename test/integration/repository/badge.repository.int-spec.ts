import { TestUtil } from '../../TestUtil';
import { BadgeRepository } from '../../../src/infrastructure/repository/badge.repository';
import { BadgeTypeEnum } from '../../../src/domain/badgeType';

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
      BadgeTypeEnum.premier_quizz,
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
      BadgeTypeEnum.premier_quizz,
    );
    await badgeRepository.createUniqueBadge(
      'utilisateur-id',
      BadgeTypeEnum.premier_quizz,
    );
    // THEN
    const badges = await TestUtil.prisma.badge.findMany({});
    expect(badges).toHaveLength(1);
  });
});
