import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import {
  KYCReponse,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../domain/kyc/questionKYC';

export class QuestionKYCReponseAPI_v2 {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty() value: string;

  public static mapToAPI(reponse: KYCReponse): QuestionKYCReponseAPI_v2 {
    return {
      code: reponse.code,
      label: reponse.label,
      value: reponse.value,
    };
  }
}

export class QuestionKYCAPI_v2 {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TypeReponseQuestionKYC })
  type: TypeReponseQuestionKYC;
  @ApiProperty({ enum: Categorie })
  categorie: Categorie;

  @ApiProperty()
  points: number;

  @ApiProperty()
  is_NGC: boolean;

  @ApiProperty()
  question: string;
  @ApiProperty({ type: [QuestionKYCReponseAPI_v2] })
  reponse: QuestionKYCReponseAPI_v2[];
  @ApiProperty({ type: [QuestionKYCReponseAPI_v2] })
  reponses_possibles?: QuestionKYCReponseAPI_v2[];
  @ApiProperty()
  thematique?: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI_v2 {
    let result: QuestionKYCAPI_v2 = {
      id: question.id,
      question: question.question,
      reponse: undefined,
      reponses_possibles: undefined,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    result.reponses_possibles = question.reponses_possibles
      ? question.reponses_possibles.map((r) =>
          QuestionKYCReponseAPI_v2.mapToAPI(r),
        )
      : [];
    result.reponse = question.reponses
      ? question.reponses.map((r) => QuestionKYCReponseAPI_v2.mapToAPI(r))
      : [];

    return result;
  }
}
