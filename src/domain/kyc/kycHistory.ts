import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { ConditionDefi } from '../defis/conditionDefi';
import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
import { KycDefinition } from './kycDefinition';
import { QuestionKYC, TypeReponseQuestionKYC } from './questionKYC';

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
  public getAllUpToDateQuestionSet(): QuestionKYC[] {
    let result = [];

    this.catalogue.forEach((question) => {
      const answered_question = this.getAnsweredQuestionByCode(question.code);
      if (answered_question) {
        answered_question.refreshFromDef(question);
      }
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

  public getUpToDateQuestionOrException(code: string): QuestionKYC {
    const question_catalogue = this.getKYCDefinitionByCodeOrException(code);
    let answered_question = this.getAnsweredQuestionByCode(code);
    if (answered_question) {
      answered_question.refreshFromDef(question_catalogue);
      return answered_question;
    }
    return QuestionKYC.buildFromDef(question_catalogue);
  }

  public getUpToDateQuestionByCodeOrNull(code: string): QuestionKYC {
    const question_catalogue = this.getKYCDefinitionByCodeOrNull(code);
    if (!question_catalogue) {
      return null;
    }

    let answered_question = this.getAnsweredQuestionByCode(code);
    if (answered_question) {
      answered_question.refreshFromDef(question_catalogue);
      return answered_question;
    }
    return QuestionKYC.buildFromDef(question_catalogue);
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

  public isQuestionAnsweredByCode(code: string): boolean {
    return !!this.getAnsweredQuestionByCode(code);
  }

  public updateQuestionyCode(questionId: string, reponses: string[]) {
    let question = this.getAnsweredQuestionByCode(questionId);
    if (question) {
      question.setResponses(reponses);
    } else {
      let question_catalogue =
        this.getKYCByCodeFromCatalogueOrException(questionId);
      question_catalogue.setResponses(reponses);
      this.answered_questions.push(question_catalogue);
    }
  }

  public checkQuestionExistsByCode(questionId: string) {
    this.getKYCDefinitionByCodeOrException(questionId);
  }

  private getAnsweredQuestionByCode(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
  }
  public getAnsweredQuestionByCMS_ID(cms_id: number): QuestionKYC {
    const found = this.answered_questions.find(
      (element) => element.id_cms === cms_id,
    );
    return found;
  }

  private getKYCByCodeFromCatalogueOrException(code: string): QuestionKYC {
    const question_def = this.catalogue.find(
      (element) => element.code === code,
    );
    if (!question_def) {
      ApplicationError.throwQuestionInconnue(code);
    }
    return QuestionKYC.buildFromDef(question_def);
  }

  private getKYCDefinitionByCodeOrException(code: string): KycDefinition {
    const question_def = this.getKYCDefinitionByCodeOrNull(code);
    if (!question_def) {
      ApplicationError.throwQuestionInconnue(code);
    }
    return question_def;
  }

  private getKYCDefinitionByCodeOrNull(code: string): KycDefinition {
    return this.catalogue.find((element) => element.code === code);
  }
}
