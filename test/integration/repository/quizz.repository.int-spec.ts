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

  it('list quizz with questions', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "1", titre: "The Quizz !"}
    })
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
      ]
    });
    const quizz = await quizzRepository.list();
    expect(quizz).toHaveLength(1);
    expect(quizz[0]["questions"]).toBeUndefined();
  });

  it('find unique quizz with children', async () => {
    await TestUtil.prisma.quizz.createMany({
      data: [
        {id: '1', titre: "l'eau c'est important"},
        {id: '2', titre: "Végé ?"}
      ]
    });
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
      ]
    });
    const quizz = await quizzRepository.getById("1");
    expect(quizz.titre).toEqual("l'eau c'est important");
    expect(quizz["questions"]).toHaveLength(2);
  });

  it('create unique quizz without ID', async () => {
    await quizzRepository.create("quizz");
    const createdQuizz = await TestUtil.prisma.quizz.findFirst({where: {}});
    expect(createdQuizz.titre).toEqual("quizz");
  });
  it('fail create quizz already existing ID', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: '1', titre: "bob"}
    });
    try {
      await quizzRepository.create("letitre", "1");
    } catch (error) {
      expect(error.message).toEqual("Un quizz d'id 1 existe déjà en base");
      return;
    }
    fail('expected error');
  });

});
