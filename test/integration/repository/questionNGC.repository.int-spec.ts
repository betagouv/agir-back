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

  it('saveOrUpdateQuestion : Creates a questionNGC', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    await questionNGCRepository.saveOrUpdateQuestion(
      'utilisateur-id',
      'key-123',
      'value-456',
    );
    // THEN
    const questions = await TestUtil.prisma.questionNGC.findMany({});
    expect(questions).toHaveLength(1);
    expect(questions[0].key).toEqual('key-123');
    expect(questions[0].value).toEqual('value-456');
    expect(questions[0].utilisateurId).toEqual('utilisateur-id');
  });
  it('saveOrUpdateQuestion : Creates a questionNGC with numeric value OK', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    await questionNGCRepository.saveOrUpdateQuestion(
      'utilisateur-id',
      'key-123',
      123,
    );
    // THEN
    const questions = await TestUtil.prisma.questionNGC.findMany({});
    expect(questions[0].value).toEqual('123');
  });
  it('saveOrUpdateQuestion : Updates an existing questionNGC', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionNGC');
    // WHEN
    await questionNGCRepository.saveOrUpdateQuestion(
      'utilisateur-id',
      '123',
      'new value',
    );
    // THEN
    const questions = await TestUtil.prisma.questionNGC.findMany({});
    expect(questions).toHaveLength(1);
    expect(questions[0].value).toEqual('new value');
  });
  it('getAllQuestionForUtilisateur : liste all questions from user', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('questionNGC', { id: '1', key: 'a', value: 'AA' });
    await TestUtil.create('questionNGC', { id: '2', key: 'b', value: 'BB' });

    // WHEN
    const liste = await questionNGCRepository.getAllQuestionForUtilisateur(
      'utilisateur-id',
    );
    // THEN
    expect(liste).toHaveLength(2);
    expect(liste).toStrictEqual([
      { key: 'a', value: 'AA' },
      { key: 'b', value: 'BB' },
    ]);
  });
});
