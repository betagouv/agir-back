import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
import { CatalogueQuestionsKYC } from './catalogueQuestionsKYC';
import {
  CategorieQuestionKYC,
  QuestionID,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from './questionQYC';

export class KYCHistory {
  answered_questions: QuestionKYC[];

  constructor(data?: KYCHistory_v0) {
    this.reset();

    if (data && data.answered_questions) {
      data.answered_questions.forEach((element) => {
        this.answered_questions.push(new QuestionKYC(element));
      });
    }
  }

  public reset() {
    this.answered_questions = [];
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

  public getKYCRestantes(categorie?: CategorieQuestionKYC): QuestionKYC[] {
    const kycs_all = CatalogueQuestionsKYC.getAll(categorie);
    this.answered_questions.forEach((question) => {
      const index = kycs_all.findIndex((d) => d.id === question.id);
      if (index !== -1) {
        kycs_all.splice(index, 1);
      }
    });
    return kycs_all;
  }

  public getQuestionOrException(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) {
      this.upgradeQuestion(answered_question);
      return answered_question;
    }
    return CatalogueQuestionsKYC.getByIdOrException(id);
  }
  public getQuestion(id: QuestionID): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) {
      this.upgradeQuestion(answered_question);
      return answered_question;
    }
    return CatalogueQuestionsKYC.getById(id);
  }

  private upgradeQuestion(question: QuestionKYC) {
    const question_catalogue = CatalogueQuestionsKYC.getByIdOrException(
      question.id,
    );
    if (
      (question.type === TypeReponseQuestionKYC.choix_multiple ||
        question.type === TypeReponseQuestionKYC.choix_unique) &&
      question.hasResponses()
    ) {
      const upgraded_set = [];
      question.reponses.forEach((reponse) => {
        const ref_label = question_catalogue.getLabelByCode(reponse.code);
        if (ref_label) {
          reponse.label = ref_label;
          upgraded_set.push(reponse);
        }
      });
      question.reponses = upgraded_set;
    }
    question.reponses_possibles = question_catalogue.reponses_possibles;
    question.question = question_catalogue.question;
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
