import { ApiProperty } from '@nestjs/swagger';
import { EnchainementKYC } from '../../../../domain/kyc/enchainementKYC';
import { QuestionKYCAPI_v2 } from './questionsKYCAPI_v2';

export enum EnchainementKYCExclude {
  repondu = 'repondu',
  non_eligible = 'non_eligible',
  rien = 'rien',
}
export class EnchainementKYCAPI {
  @ApiProperty() nombre_total_questions: number;
  @ApiProperty() nombre_total_questions_effectives: number;
  @ApiProperty() position_courante: number;
  @ApiProperty() is_first: boolean;
  @ApiProperty() is_last: boolean;
  @ApiProperty() is_out_of_range: boolean;
  @ApiProperty({ type: QuestionKYCAPI_v2 })
  question_courante: QuestionKYCAPI_v2;

  public static mapToAPI(enchainement: EnchainementKYC): EnchainementKYCAPI {
    const position_courante = enchainement.getPositionCourante();

    return {
      nombre_total_questions: enchainement.getNombreTotalQuestions(),
      nombre_total_questions_effectives:
        enchainement.getNombreTotalQuestionsEligibles(),
      position_courante: Number.isNaN(position_courante)
        ? -1
        : position_courante,
      question_courante: enchainement.getKycCourante()
        ? QuestionKYCAPI_v2.mapToAPI(enchainement.getKycCourante())
        : undefined,
      is_first: enchainement.isFirst(),
      is_last: enchainement.isLast(),
      is_out_of_range: Number.isNaN(position_courante),
    };
  }
}
