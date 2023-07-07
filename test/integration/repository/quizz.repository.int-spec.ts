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

  it('list quizz', async () => {
    await TestUtil.prisma.quizz.createMany({
      data: [
        { id: '1', titre: "l'eau c'est important" },
        { id: '2', titre: 'Végé ?' },
      ],
    });
    const quizz = await quizzRepository.list();
    expect(quizz).toHaveLength(2);
  });

  it('list quizz without questions', async () => {
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    const quizz = await quizzRepository.list();
    expect(quizz).toHaveLength(1);
    expect(quizz[0]['questions']).toBeUndefined();
  });

  it('find unique quizz with children', async () => {
    await TestUtil.create('quizz');
    await TestUtil.create('quizzQuestion');
    await TestUtil.create('quizzQuestion', { id: '2' });
    const quizz = await quizzRepository.getById('quizz-id');
    expect(quizz.titre).toEqual('titre');
    expect(quizz['questions']).toHaveLength(2);
  });

  it('fail create quizz already existing ID', async () => {
    await TestUtil.prisma.quizz.create({
      data: { id: '1', titre: 'bob' },
    });
    try {
      await quizzRepository.create('letitre', '1');
    } catch (error) {
      expect(error.message).toEqual("Un quizz d'id 1 existe déjà en base");
      return;
    }
    fail('expected error');
  });
});
