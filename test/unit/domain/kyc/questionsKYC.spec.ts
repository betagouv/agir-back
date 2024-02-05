import { CollectionQuestionsKYC } from '../../../../src/domain/kyc/collectionQuestionsKYC';

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('constructeur OK', () => {
    // WHEN
    const questionsKYC = new CollectionQuestionsKYC();

    // THEN
    expect(questionsKYC.getAllQuestionSet()).toHaveLength(5);
  });
  it('isQuestionAnswered :false si pas répondu', () => {
    // WHEN
    const questionsKYC = new CollectionQuestionsKYC();

    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(false);
  });
  it('isQuestionAnswered :true si répondu', () => {
    // WHEN
    const questionsKYC = new CollectionQuestionsKYC();
    questionsKYC.updateQuestion('2', ['yo']);
    // THEN
    expect(questionsKYC.isQuestionAnswered('2')).toStrictEqual(true);
  });
});
