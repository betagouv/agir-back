import { Injectable } from '@nestjs/common';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { QuestionNGC } from '@prisma/client';

@Injectable()
export class QuestionNGCUsecase {
  constructor(
    private questionNGCRepository: QuestionNGCRepository,
    private bilanRepository: BilanRepository,
    private nGCCalculator: NGCCalculator,
  ) {}

  async createOrUpdateQuestion(
    utilisateurId: string,
    key: string,
    value: string,
  ): Promise<QuestionNGC> {
    const newSituation =
      (await this.bilanRepository.getLastSituationbyUtilisateurId(
        utilisateurId,
      )) || {};

    newSituation[key] = value.toString();

    const newDBSituation = await this.bilanRepository.createSituation(
      newSituation,
    );

    const newComputedBilan =
      this.nGCCalculator.computeBilanFromSituation(newSituation);

    await this.bilanRepository.createBilan(
      newDBSituation.id,
      utilisateurId,
      newComputedBilan,
    );

    return this.questionNGCRepository.saveOrUpdateQuestion(
      utilisateurId,
      key,
      value,
    );
  }
}
