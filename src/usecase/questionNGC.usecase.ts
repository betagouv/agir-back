import { Injectable } from '@nestjs/common';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { QuestionNGC } from '@prisma/client';

@Injectable()
export class QuestionNGCUsecase {
  constructor(private questionNGCRepository: QuestionNGCRepository) {}

  async createOrUpdateQuestion(
    utilisateurId: string,
    key: string,
    value: string,
  ): Promise<QuestionNGC> {
    return this.questionNGCRepository.saveOrUpdateQuestion(
      utilisateurId,
      key,
      value,
    );
  }
}
