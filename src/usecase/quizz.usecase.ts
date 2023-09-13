import { Quizz as QuizzDB } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { QuizzQuestion } from '@prisma/client';
import { QuizzAPI } from '../../src/infrastructure/api/types/quizzAPI';
import { BadgeTypes } from '../domain/badge/badgeTypes';
import { BodyReponsesQuizz } from '../infrastructure/api/types/reponsesQuizz';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class QuizzUsecase {
  constructor(
    private quizzRepository: QuizzRepository,
    private badgeRepository: BadgeRepository,
  ) {}

  async getQuizzById(quizzId: string): Promise<QuizzAPI> {
    const result = await this.quizzRepository.getById(quizzId);
    // FIXME : temp rename
    result['questions'].forEach((question) => {
      question['texte_riche_explication'] = question.texte_riche_ko;
    });
    return result;
  }
}
