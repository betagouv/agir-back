import { TestUtil } from '../../TestUtil';
import {QuizzQuestionRepository} from '../../../src/infrastructure/repository/quizzQuestion.repository';

describe('QuizzRepository', () => {
  let quizzQuestionRepository = new QuizzQuestionRepository(TestUtil.prisma);

  beforeAll(async () => {
    TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  })

  afterAll(async () => {
    await TestUtil.appclose();
  })

  it('list quizz questions', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "1", titre: "The Quizz !"}
    })
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
      ]
    });
    const quizzQuestions = await quizzQuestionRepository.list();
    expect(quizzQuestions).toHaveLength(2);
  });

  it('find unique quizz question', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "1", titre: "The Quizz !"}
    })
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "1"},
        {id: '2', libelle: "question2", solution:"1", propositions: ["1","2"], quizzId: "1"}
      ]
    });
    const quizzQuestion = await quizzQuestionRepository.getById("1");
    expect(quizzQuestion.libelle).toEqual("question1");
  });

  it('create unique quizz without ID', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "1", titre: "The Quizz !"}
    })
    await quizzQuestionRepository.create("question1","1", ["1","2"],"1");
    const createdQuizzQuestion = await TestUtil.prisma.quizzQuestion.findFirst({where: {}});
    expect(createdQuizzQuestion.libelle).toEqual("question1");
  });
  it('fail create quizzquestion already existing ID', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "quizz1", titre: "The Quizz !"}
    })
    await TestUtil.prisma.quizzQuestion.createMany({
      data: [
        {id: '1', libelle: "question1", solution:"10", propositions: ["1","5", "10"], quizzId: "quizz1"}
      ]
    });
    try {
      await quizzQuestionRepository.create("question1","5", ["1","2"],"quizz1", "1");
    } catch (error) {
      expect(error.message).toEqual("Une question de quizz d'id 1 existe déjà en base");
      return;
    }
    fail('expected error');
  });
  it('fail create quizzquestion when missing questionnaire  ID', async () => {
    await TestUtil.prisma.quizz.create({
      data: {id: "quizz1", titre: "The Quizz !"}
    })
    try {
      await quizzQuestionRepository.create("question1","5", ["1","2"],"bad-quizz-id");
    } catch (error) {
      expect(error.message).toEqual("Aucun questionnaire d'id bad-quizz-id n'existe en base");
      return;
    }
    fail('expected error');
  });

});
