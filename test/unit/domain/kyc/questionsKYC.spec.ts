import { response } from 'express';
import {
  CollectionQuestionsKYC,
  QuestionKYC,
} from '../../../../src/domain/kyc/collectionQuestionsKYC';

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('constructeur OK', () => {
    // WHEN
    const questionsKYC = CollectionQuestionsKYC.newCollectionQuestionsKYC();

    // THEN
    expect(questionsKYC.getAllQuestions()).toHaveLength(5);
  });
  it('isQuestionAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = CollectionQuestionsKYC.newCollectionQuestionsKYC();

    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(false);
  });
  it('isQuestionAnswered :true si répondu', () => {
    // WHEN
    const questionsKYC = CollectionQuestionsKYC.newCollectionQuestionsKYC();
    questionsKYC.updateQuestion('2', ['yo']);
    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(true);
  });
});
