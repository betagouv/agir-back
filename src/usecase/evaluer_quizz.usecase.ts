import { Injectable } from '@nestjs/common';
import { QuizzQuestion } from '@prisma/client';
import { ReponsesQuizz } from 'src/infrastructure/api/types/reponsesQuizz';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class EvaluerQuizzUsecase {
  constructor(private quizzRepository: QuizzRepository) {}

  async doIt(reponsesQuizz: ReponsesQuizz, quizzId:string): Promise<boolean> {
    let quizz = await this.quizzRepository.getById(quizzId);
    return this.checkQuizz(reponsesQuizz, quizz["questions"]);
  }

  public findReponseForQuestionId(reponsesQuizz:ReponsesQuizz, id:string) {
    const found = reponsesQuizz.reponses.find(element => {
      return Object.keys(element)[0] === id;
    });
    return Object.values(found)[0]
  }
  public checkQuizz(reponsesQuizz: ReponsesQuizz, questions:QuizzQuestion[]): boolean {
    let success = true;
    questions.forEach(element => {
      success = success && (element.solution == this.findReponseForQuestionId(reponsesQuizz, element.id));
    })
    return success;
  }
}
