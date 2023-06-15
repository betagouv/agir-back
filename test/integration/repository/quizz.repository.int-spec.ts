import { TestUtil } from '../../TestUtil';
import {QuizzRepository} from '../../../src/infrastructure/repository/quizz.repository';

describe('QuizzRepository', () => {
  let quizzRepository = new QuizzRepository(TestUtil.prisma);

  beforeAll(async () => {
    TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('list quizz', async () => {
    await TestUtil.prisma.quizz.createMany({
      data: [
        {id: '1', titre: "l'eau c'est important"},
        {id: '2', titre: "Végé ?"}
      ]
    });
    const quizz = await quizzRepository.list();
    expect(quizz).toHaveLength(2);
  });

  it('find unique quizz', async () => {
    await TestUtil.prisma.quizz.createMany({
      data: [
        {id: '1', titre: "l'eau c'est important"},
        {id: '2', titre: "Végé ?"}
      ]
    });
    const quizz = await quizzRepository.getById("1");
    expect(quizz.titre).toEqual("l'eau c'est important");
  });

  it('create unique quizz without ID', async () => {
    await quizzRepository.create("quizz");
    const createdQuizz = await TestUtil.prisma.quizz.findFirst({where: {}});
    expect(createdQuizz.titre).toEqual("quizz");
  });

});
