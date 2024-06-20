import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { ConditionDefi } from '../defis/conditionDefi';
import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
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
      let answered_question = this.getAnsweredQuestionByCode(question.code);
      result.push(answered_question || QuestionKYC.buildFromDef(question));
    });

    return result;
  }

  public getKYCRestantes(
    categorie?: Categorie,
    univers?: string,
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
    let answered_question = this.getAnsweredQuestionByCode(id);
    if (answered_question) {
      this.upgradeQuestion(answered_question);
      return answered_question;
    }
    return this.getKYCByIdOrException(id);
  }

  public getQuestion(id: string): QuestionKYC {
    let answered_question = this.getAnsweredQuestionByCode(id);
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
      question.hasAnyResponses()
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

  public areConditionsMatched(conditions: ConditionDefi[][]): boolean {
    if (conditions.length === 0) {
      return true;
    }
    let result = false;
    for (const OU of conditions) {
      let union = true;
      for (const cond of OU) {
        const kyc = this.getAnsweredQuestionByCMS_ID(cond.id_kyc);
        if (!(kyc && kyc.includesReponseCode(cond.code_reponse))) {
          union = false;
        }
      }
      result = result || union;
    }
    return result;
  }

  public isQuestionAnswered(id: string): boolean {
    return !!this.getAnsweredQuestionByCode(id);
  }

  public updateQuestion(questionId: string, reponses: string[]) {
    let question = this.getAnsweredQuestionByCode(questionId);
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

  private getAnsweredQuestionByCode(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
  }
  public getAnsweredQuestionByCMS_ID(id: string): QuestionKYC {
    return this.answered_questions.find(
      (element) => element.id_cms.toString() == id,
    );
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
