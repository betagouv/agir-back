import { Quizz } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class LireQuizzUsecase {
  constructor(private quizzRepository: QuizzRepository) {}

  async doIt(quizzId:string): Promise<Quizz> {
    return this.quizzRepository.getById(quizzId);
  }
}
