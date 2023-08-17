import { TestUtil } from '../../TestUtil';
import { QuestionNGCRepository } from '../../../src/infrastructure/repository/questionNGC.repository';

describe('QuestionNGCRepository', () => {
  let questionNGCRepository = new QuestionNGCRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('Creates a questionNGC', async () => {
    await TestUtil.create('utilisateur');
    await questionNGCRepository.saveOrUpdateQuestion(
      'utilisateur-id',
      'key-123',
      'value-456',
    );
    const questions = await TestUtil.prisma.questionNGC.findMany({});
    expect(questions).toHaveLength(1);
    expect(questions[0].key).toEqual('key-123');
    expect(questions[0].value).toEqual('value-456');
    expect(questions[0].utilisateurId).toEqual('utilisateur-id');
  });
  it('Updates an existing questionNGC', async () => {
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionNGC');
    await questionNGCRepository.saveOrUpdateQuestion(
      'utilisateur-id',
      '123',
      'new value',
    );
    const questions = await TestUtil.prisma.questionNGC.findMany({});
    expect(questions).toHaveLength(1);
    expect(questions[0].value).toEqual('new value');
  });
});
