import { ApplicationError } from '../../infrastructure/applicationError';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',
  entier = 'entier',
  decimal = 'decimal',
}

export enum CategorieQuestionKYC {
  service = 'service',
}

export class QuestionKYCData {
  id: string;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  points: number;
  is_NGC: boolean;
  reponse?: string[];
  reponses_possibles?: string[];
  ngc_key?: string;
}

export class QuestionKYC extends QuestionKYCData {
  constructor(data: QuestionKYCData) {
    super();
    Object.assign(this, data);
  }
}

const CATALOGUE_QUESTIONS = require('./catalogueKYC');

export class CollectionQuestionsKYC {
  constructor(data: CollectionQuestionsKYC) {
    this.liste_questions = [];
    if (data && data.liste_questions) {
      data.liste_questions.forEach((element) => {
        this.liste_questions.push(new QuestionKYC(element));
      });
    }
  }
  liste_questions: QuestionKYC[];

  public static newCollectionQuestionsKYC(): CollectionQuestionsKYC {
    return new CollectionQuestionsKYC(undefined);
  }
  public getAllQuestions(): QuestionKYC[] {
    let result: QuestionKYC[] = [];
    CATALOGUE_QUESTIONS.forEach((element) => {
      let reponse = this.getAnsweredQuestion(element.id);
      result.push(reponse || new QuestionKYC(element));
    });
    return result;
  }
  public getQuestion(id: string): QuestionKYC {
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
      this.liste_questions.push(catalogue_question);
    }
  }

  public checkQuestionExistsOrThrowException(questionId: string) {
    let catalogue_question = this.getCatalogueQuestion(questionId);
    if (!catalogue_question) {
      ApplicationError.throwQuestionInconnue(questionId);
    }
  }

  private getAnsweredQuestion(id: string): QuestionKYC {
    return this.liste_questions.find((element) => element.id === id);
  }
  private getCatalogueQuestion(id: string): QuestionKYC {
    const question = CATALOGUE_QUESTIONS.find((element) => element.id === id);
    if (question) {
      return new QuestionKYC(question);
    }
    return undefined;
  }
}
