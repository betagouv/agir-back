import { CatalogueQuestionsKYC } from '../../../../src/domain/kyc/catalogueQuestionsKYC';
import { KYC } from '../../../../src/domain/kyc/kyc';

describe('QuestionsQYC && CollectionQuestionsKYC', () => {
  it('constructeur OK', () => {
    // WHEN
    const questionsKYC = new KYC();

    // THEN
    expect(questionsKYC.getAllQuestionSet()).toHaveLength(
      CatalogueQuestionsKYC.getTailleCatalogue(),
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
  it('updateQuestion : exeption si question id inconnu', () => {
    // GIVEN
    const questionsKYC = new KYC();

    // WHEN
    try {
      questionsKYC.updateQuestion('1234', ['yo']);
      fail();
    } catch (error) {
      // THEN
      expect(error.code).toEqual('030');
    }
  });
});
