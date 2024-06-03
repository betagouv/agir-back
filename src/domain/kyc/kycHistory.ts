import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
import { Univers } from '../univers/univers';
import { KycDefinition } from './kycDefinition';
import { QuestionKYC, TypeReponseQuestionKYC } from './questionQYC';

export class KYCHistory {
  answered_questions: QuestionKYC[];
  catalogue: KycDefinition[];

  constructor(data?: KYCHistory_v0) {
    this.reset();

    if (data && data.answered_questions) {
      data.answered_questions.forEach((element) => {
        this.answered_questions.push(new QuestionKYC(element));
      });
    }
  }

  public setCatalogue(cat: KycDefinition[]) {
    this.catalogue = cat;
  }

  public reset() {
    this.answered_questions = [];
    this.catalogue = [];
  }
  public getAllQuestionSet(): QuestionKYC[] {
    let result = [];

    this.catalogue.forEach((question) => {
      let answered_question = this.getAnsweredQuestion(question.code);
      result.push(answered_question || QuestionKYC.buildFromDef(question));
    });

    return result;
  }

  public getKYCRestantes(
    categorie?: Categorie,
    univers?: Univers,
  ): QuestionKYC[] {
    let kycs_all = this.getAllKYCByCategorie(categorie);
    this.answered_questions.forEach((question) => {
      const index = kycs_all.findIndex((d) => d.id === question.id);
      if (index !== -1) {
        kycs_all.splice(index, 1);
      }
    });

    if (univers) {
      kycs_all = kycs_all.filter(
        (k) => k.universes.includes(univers) || k.universes.length === 0,
      );
    }

    return kycs_all;
  }

  private getAllKYCByCategorie(categorie?: Categorie): QuestionKYC[] {
    if (!categorie) {
      return this.catalogue.map((c) => QuestionKYC.buildFromDef(c));
    }
    return this.catalogue
      .filter((c) => c.categorie === categorie)
      .map((c) => QuestionKYC.buildFromDef(c));
  }

  public getQuestionOrException(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) {
      this.upgradeQuestion(answered_question);
      return answered_question;
    }
    return this.getKYCByIdOrException(id);
  }

  public getQuestion(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestion(id);
    if (answered_question) {
      this.upgradeQuestion(answered_question);
      return answered_question;
    }
    return this.getKYCById(id);
  }

  private upgradeQuestion(question: QuestionKYC) {
    const question_catalogue = this.getKYCByIdOrException(question.id);
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
      let question_catalogue = this.getKYCByIdOrException(questionId);
      question_catalogue.setResponses(reponses);
      this.answered_questions.push(question_catalogue);
    }
  }

  public checkQuestionExists(questionId: string) {
    this.getKYCByIdOrException(questionId);
  }

  private getAnsweredQuestion(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
  }

  private getKYCByIdOrException(id: string): QuestionKYC {
    const question_def = this.catalogue.find((element) => element.code === id);
    if (question_def) {
      return QuestionKYC.buildFromDef(question_def);
    }
    ApplicationError.throwQuestionInconnue(id);
  }

  private getKYCById(id: string): QuestionKYC {
    const def = this.catalogue.find((element) => element.code === id);
    return def ? QuestionKYC.buildFromDef(def) : null;
  }
}
