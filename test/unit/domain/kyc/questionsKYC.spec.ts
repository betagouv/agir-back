import { KYC } from '../../../../src/domain/kyc/collectionQuestionsKYC';

const CATALOGUE_QUESTIONS = require('../../../../src/domain/kyc/catalogueKYC');

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('constructeur OK', () => {
    // WHEN
    const questionsKYC = new KYC();

    // THEN
    expect(questionsKYC.getAllQuestionSet()).toHaveLength(
      CATALOGUE_QUESTIONS.length,
    );
  });
  it('isQuestionAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new KYC();

    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(false);
  });
  it('isQuestionAnswered :true si répondu', () => {
    // WHEN
    const questionsKYC = new KYC();
    questionsKYC.updateQuestion('1', ['yo']);
    // THEN
    expect(questionsKYC.isQuestionAnswered('1')).toStrictEqual(true);
  });
});
