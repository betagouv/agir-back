import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
import { CatalogueQuestionsKYC } from './catalogueQuestionsKYC';
import { CategorieQuestionKYC, QuestionKYC } from './questionQYC';

export class KYCHistory {
  answered_questions: QuestionKYC[];

  constructor(data?: KYCHistory_v0) {
    this.answered_questions = [];
    if (data && data.answered_questions) {
      data.answered_questions.forEach((element) => {
        this.answered_questions.push(new QuestionKYC(element));
      });
    }
  }

  public getAllQuestionSet(): QuestionKYC[] {
    let result = [];

    const all = CatalogueQuestionsKYC.getAll();

    all.forEach((question) => {
      let answered_question = this.getAnsweredQuestion(question.id);
      result.push(answered_question || question);
    });

    return result;
  }

  public getDefisRestants(): QuestionKYC[] {
    const result = [];
    const defis = CatalogueQuestionsKYC.getByCategorie(
      CategorieQuestionKYC.defi,
    );
    defis.forEach((defi) => {
      if (!this.isQuestionAnswered(defi.id)) {
        result.push(defi);
      }
    });
    return result;
  }

  public getQuestionOrException(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) return answered_question;

    const catalogue_question = CatalogueQuestionsKYC.getByIdOrException(id);
    return new QuestionKYC(catalogue_question);
  }

  public isQuestionAnswered(id: string): boolean {
    return !!this.getAnsweredQuestion(id);
  }

  public updateQuestion(questionId: string, reponses: string[]) {
    let question = this.getAnsweredQuestion(questionId);
    if (question) {
      question.setResponses(reponses);
    } else {
      let question_catalogue =
        CatalogueQuestionsKYC.getByIdOrException(questionId);
      question_catalogue.setResponses(reponses);
      this.answered_questions.push(question_catalogue);
    }
  }

  public checkQuestionExists(questionId: string) {
    CatalogueQuestionsKYC.getByIdOrException(questionId);
  }

  private getAnsweredQuestion(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
  }
}
