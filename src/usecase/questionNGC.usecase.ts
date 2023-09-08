import { Injectable } from '@nestjs/common';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { Question } from '../../src/domain/bilan/question';

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
  ): Promise<Question> {
    const savedQuestion = await this.questionNGCRepository.saveOrUpdateQuestion(
      utilisateurId,
      key,
      value,
    );

    const questionList =
      await this.questionNGCRepository.getAllQuestionForUtilisateur(
        utilisateurId,
      );

    const currentSituation =
      await this.bilanRepository.getLastSituationbyUtilisateurId(utilisateurId);

    const newSituation = this.overrideSituationWithQuestionListe(
      currentSituation,
      questionList,
    );

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

    return savedQuestion;
  }

  private overrideSituationWithQuestionListe(
    situation: object,
    questionList: Question[],
  ): object {
    const result = { ...situation };
    questionList.forEach((question) => {
      result[question.key] = question.value;
    });
    return result;
  }
}
