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

  it('fail create quizz already existing ID', async () => {
    // GIVEN
    await TestUtil.prisma.quizz.create({
      data: { id: '1', titre: 'bob' },
    });
    // WHEN
    try {
      await quizzRepository.create('letitre', '1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual("Un quizz d'id 1 existe déjà en base");
      return;
    }
    fail('expected error');
  });
});
