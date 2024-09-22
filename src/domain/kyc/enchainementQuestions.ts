import { QuestionGeneric } from './questionGeneric';

export class EnchainementQuestions {
  constructor() {
    this.liste_questions = [];
  }
  liste_questions: QuestionGeneric[];

  public addQuestionGeneric(question: QuestionGeneric) {
    this.liste_questions.push(question);
  }

  public getProgression(): { current: number; target: number } {
    let progression = 0;
    for (const question of this.liste_questions) {
      if (question.kyc) {
        if (question.kyc.hasAnyResponses()) {
          progression++;
        }
      } else {
        if (question.mosaic.is_answered) {
          progression++;
        }
      }
    }
    return { current: progression, target: this.liste_questions.length };
  }
}
