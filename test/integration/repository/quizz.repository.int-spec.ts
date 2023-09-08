import { TestUtil } from '../../TestUtil';
import { QuizzRepository } from '../../../src/infrastructure/repository/quizz.repository';

describe('QuizzRepository', () => {
  let quizzRepository = new QuizzRepository(TestUtil.prisma);

  beforeAll(async () => {
    TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('find unique quizz with children', async () => {
    // GIVEN
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: '2' });
    // WHEN
    const quizz = await quizzRepository.getById('quizz-id');
    // THEN
    expect(quizz.titre).toEqual('titre');
    expect(quizz['questions']).toHaveLength(2);
  });
});
