import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import {
  KYCReponse,
  KYCReponseComplexe,
  KYCReponseSimple,
  QuestionKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../domain/kyc/questionKYC';

export class ReponseUniqueAPI {
  @ApiProperty() value: string;
  @ApiProperty({ enum: Unite, required: false }) unite: Unite;

  public static mapToAPI(reponse: KYCReponseSimple): ReponseUniqueAPI {
    return {
      unite: reponse.unite,
      value: reponse.value,
    };
  }
}
export class ReponseMultipleAPI {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty({ required: false }) value?: string;
  @ApiProperty({ required: false }) emoji?: string;
  @ApiProperty({ required: false }) image_url?: string;
  @ApiProperty({ enum: Unite, required: false }) unite?: Unite;

  public static mapToAPI(reponse: KYCReponseComplexe): ReponseMultipleAPI {
    return {
      code: reponse.code,
      label: reponse.label,
      value: reponse.value,
      emoji: reponse.emoji,
      image_url: reponse.image_url,
      unite: reponse.unite,
    };
  }
}

export class QuestionKYCAPI_v2 {
  @ApiProperty()
  code: string;

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

  @ApiProperty()
  is_answered: boolean;

  @ApiProperty({ type: ReponseUniqueAPI })
  reponse_unique: ReponseUniqueAPI;

  @ApiProperty({ type: [ReponseMultipleAPI] })
  reponse_multiple?: ReponseMultipleAPI[];

  @ApiProperty()
  thematique?: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI_v2 {
    let result: QuestionKYCAPI_v2 = {
      code: question.code,
      question: question.question,
      reponse_unique: undefined,
      reponse_multiple: undefined,
      is_answered: question.is_answererd,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    if (question.isSimpleQuestion()) {
      result.reponse_unique = {
        value: question.getReponseSimpleValue(),
        unite: question.getReponseSimpleUnite(),
      };
    } else if (question.isChoixQuestion()) {
      result.reponse_multiple = question
        .getListeReponsesComplexes()
        .map((r) => ({
          code: r.code,
          label: r.label,
          value: r.value,
        }));
    } else if (question.isMosaic()) {
      result.reponse_multiple = question
        .getListeReponsesComplexes()
        .map((r) => ({
          code: r.code,
          label: r.label,
          value: r.value,
          emoji: r.emoji,
          image_url: r.image_url,
          unite: r.unite,
        }));
      result.is_answered = question.is_mosaic_answered;
    }
    return result;
  }
}
