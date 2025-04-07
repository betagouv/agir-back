import { ApiProperty } from '@nestjs/swagger';
import { EnchainementKYC } from '../../../../domain/kyc/enchainementKYC';
import { QuestionKYCAPI_v2 } from './questionsKYCAPI_v2';

export class EnchainementKYCAPI {
  @ApiProperty() nombre_total_questions: number;
  @ApiProperty() nombre_total_questions_eligibles: number;
  @ApiProperty() position_courante: number;
  @ApiProperty() position_courante_parmi_eligibles: number;
  @ApiProperty() is_first: boolean;
  @ApiProperty() is_last: boolean;
  @ApiProperty() is_out_of_range: boolean;
  @ApiProperty() is_eligible: boolean;
  @ApiProperty({ type: QuestionKYCAPI_v2 })
  question_courante: QuestionKYCAPI_v2;

  public static mapToAPI(enchainement: EnchainementKYC): EnchainementKYCAPI {
    const position_courante = enchainement.getPositionCourante();
    const position_courante_parmi_eligibles =
      enchainement.getPositionCouranteDansEligibles();

    return {
      nombre_total_questions: enchainement.getNombreTotalQuestions(),
      nombre_total_questions_eligibles:
        enchainement.getNombreTotalQuestionsEligibles(),
      position_courante: Number.isNaN(position_courante)
        ? -1
        : position_courante + 1,
      position_courante_parmi_eligibles: Number.isNaN(
        position_courante_parmi_eligibles,
      )
        ? -1
        : position_courante_parmi_eligibles + 1,
      question_courante: enchainement.getKycCourante()
        ? QuestionKYCAPI_v2.mapToAPI(enchainement.getKycCourante())
        : undefined,
      is_first: enchainement.isCurrentFirstEligible(),
      is_last: enchainement.isCurrentLastEligible(),
      is_out_of_range: Number.isNaN(position_courante),
      is_eligible: enchainement.isCouranteEligible(),
    };
  }
}
