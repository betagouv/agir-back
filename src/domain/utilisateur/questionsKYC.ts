import { ApplicationError } from '../../../src/infrastructure/applicationError';

export class QuestionKYC {
  constructor(data: QuestionKYC) {
    Object.assign(this, data);
  }
  id: string;
  question: string;
  reponse: string;
}

const CATALOGUE_QUESTIONS: QuestionKYC[] = [
  { id: '1', question: 'Comment avez vous connu le service ?', reponse: null },
  {
    id: '2',
    question: `Quelle est votre sujet principal de pré-occupation ?`,
    reponse: null,
  },
  {
    id: '3',
    question: `Est-ce qu'une analyse automatique de votre conso electrique vous intéresse ?`,
    reponse: null,
  },
];
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

  public getAllQuestions(): QuestionKYC[] {
    let result: QuestionKYC[] = [];
    CATALOGUE_QUESTIONS.forEach((element) => {
      let reponse = this.getRespondedQuestion(element.id);
      result.push(reponse || element);
    });
    return result;
  }
  public getQuestion(id: string): QuestionKYC {
    let done_question = this.liste_questions.find(
      (element) => element.id === id,
    );
    if (done_question) return done_question;

    done_question = CATALOGUE_QUESTIONS.find((element) => element.id === id);
    if (done_question) return new QuestionKYC(done_question);
    return undefined;
  }
  public updateQuestion(questionId: string, reponse: string) {
    let question = this.getRespondedQuestion(questionId);
    if (question) {
      question.reponse = reponse;
    } else {
      let catalogue_question = this.getCatalogueQuestion(questionId);
      if (catalogue_question) {
        this.liste_questions.push(
          new QuestionKYC({
            id: questionId,
            question: catalogue_question.question,
            reponse: reponse,
          }),
        );
      } else {
        ApplicationError.throwQuestionInconnue(questionId);
      }
    }
  }

  private getRespondedQuestion(id: string) {
    return this.liste_questions.find((element) => element.id === id);
  }
  private getCatalogueQuestion(id: string) {
    return CATALOGUE_QUESTIONS.find((element) => element.id === id);
  }
}
