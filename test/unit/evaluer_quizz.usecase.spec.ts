import { EvaluerQuizzUsecase } from '../../src/usecase/evaluer_quizz.usecase';
import { QuizzQuestion } from '@prisma/client';
import { BodyReponsesQuizz } from 'src/infrastructure/api/types/reponsesQuizz';

describe('EvaluerQuizzUsecase', () => {
  let evaluerQuizzUsecase = new EvaluerQuizzUsecase(null, null);

  describe('findReponseForQuestionId', () => {
    it('should find value for given id', () => {
      const listReponses = {
        utilisateur: 'bob',
        reponses: [{ '1': '11' }, { '2': '22' }],
      };
      const value = evaluerQuizzUsecase.findReponseForQuestionId(
        listReponses,
        '2',
      );
      expect(value).toEqual('22');
    });
  });
  describe('checkQuizz', () => {
    it('should return true when all ok response', () => {
      const listReponses = {
        utilisateur: 'bob',
        reponses: [{ '1': '11' }, { '2': '22' }],
      };
      const quest1: QuizzQuestion = {
        id: '1',
        solution: '11',
        libelle: 'bla',
        quizzId: 'quizzId',
        propositions: [],
      };
      const quest2: QuizzQuestion = {
        id: '2',
        solution: '22',
        libelle: 'bla',
        quizzId: 'quizzId',
        propositions: [],
      };
      const listQuestions = [quest1, quest2];

      const value = evaluerQuizzUsecase.checkQuizz(listReponses, listQuestions);
      expect(value).toEqual(true);
    });
  });
  describe('checkQuizz', () => {
    it('should return false when at least one wrong answer', () => {
      const listReponses = {
        utilisateur: 'bob',
        reponses: [{ '1': 'bad' }, { '2': '22' }],
      };
      const quest1: QuizzQuestion = {
        id: '1',
        solution: '11',
        libelle: 'bla',
        quizzId: 'quizzId',
        propositions: [],
      };
      const quest2: QuizzQuestion = {
        id: '2',
        solution: '22',
        libelle: 'bla',
        quizzId: 'quizzId',
        propositions: [],
      };
      const listQuestions = [quest1, quest2];

      const value = evaluerQuizzUsecase.checkQuizz(listReponses, listQuestions);
      expect(value).toEqual(false);
    });
  });
});
