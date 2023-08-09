import { Quizz } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class LireQuizzUsecase {
  constructor(private quizzRepository: QuizzRepository) {}

  async doIt(quizzId: string): Promise<Quizz> {
    const result = await this.quizzRepository.getById(quizzId);
    // FIXME : temp rename
    result['questions'].forEach((question) => {
      question['texte_riche_explication'] = question.texte_riche_ko;
    });
    return result;
  }
}
