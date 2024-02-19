import { ApplicationError } from '../../infrastructure/applicationError';
import { KYC_v0 } from '../object_store/kyc/kyc_v0';
import { QuestionKYC } from './questionQYC';

const CATALOGUE_QUESTIONS = require('./catalogueKYC');

export class KYC {
  answered_questions: QuestionKYC[];

  constructor(data?: KYC_v0) {
    this.answered_questions = [];
    if (data && data.answered_questions) {
      data.answered_questions.forEach((element) => {
        this.answered_questions.push(new QuestionKYC(element));
      });
    }
  }

  public getAllQuestionSet(): QuestionKYC[] {
    let result: QuestionKYC[] = [];
    CATALOGUE_QUESTIONS.forEach((element) => {
      let reponse = this.getAnsweredQuestion(element.id);
      result.push(reponse || new QuestionKYC(element));
    });
    return result;
  }

  public getAnyQuestion(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) return answered_question;

    const catalogue_question = this.getCatalogueQuestion(id);
    if (catalogue_question) return new QuestionKYC(catalogue_question);
    return undefined;
  }

  public isQuestionAnswered(id: string): boolean {
    let answered_question = this.getAnsweredQuestion(id);
    if (!answered_question) return false;
    return !!answered_question.reponse;
  }

  public updateQuestion(questionId: string, reponse: string[]) {
    let question = this.getAnsweredQuestion(questionId);
    if (question) {
      question.reponse = reponse;
    } else {
      let catalogue_question = this.getCatalogueQuestion(questionId);
      catalogue_question.reponse = reponse;
      this.answered_questions.push(catalogue_question);
    }
  }

  public checkQuestionExistsOrThrowException(questionId: string) {
    let catalogue_question = this.getCatalogueQuestion(questionId);
    if (!catalogue_question) {
      ApplicationError.throwQuestionInconnue(questionId);
    }
  }

  private getAnsweredQuestion(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
  }
  private getCatalogueQuestion(id: string): QuestionKYC {
    const question = CATALOGUE_QUESTIONS.find((element) => element.id === id);
    if (question) {
      return new QuestionKYC(question);
    }
    return undefined;
  }
}
