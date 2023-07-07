import { Injectable } from '@nestjs/common';
import { QuizzQuestion } from '@prisma/client';
import { BodyReponsesQuizz } from 'src/infrastructure/api/types/reponsesQuizz';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class EvaluerQuizzUsecase {
  constructor(private quizzRepository: QuizzRepository) {}

  async doIt(
    bodyReponsesQuizz: BodyReponsesQuizz,
    quizzId: string,
  ): Promise<boolean> {
    let quizz = await this.quizzRepository.getById(quizzId);
    const success = this.checkQuizz(bodyReponsesQuizz, quizz['questions']);
    return success;
  }

  public findReponseForQuestionId(
    reponsesQuizz: BodyReponsesQuizz,
    id: string,
  ) {
    const found = reponsesQuizz.reponses.find((element) => {
      return Object.keys(element)[0] === id;
    });
    return Object.values(found)[0];
  }
  public checkQuizz(
    bodyReponsesQuizz: BodyReponsesQuizz,
    questions: QuizzQuestion[],
  ): boolean {
    let success = true;
    questions.forEach((element) => {
      success =
        success &&
        element.solution ==
          this.findReponseForQuestionId(bodyReponsesQuizz, element.id);
    });
    return success;
  }
}
