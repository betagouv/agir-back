import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import { QuestionKYC } from '../../../../domain/kyc/questionKYC';
import {
  KYCReponseSimple,
  TypeReponseQuestionKYC,
  Unite,
} from '../../../../domain/kyc/QuestionKYCData';

export class UniteAPI {
  @ApiProperty({}) abreviation: string;
  @ApiProperty({ required: false }) long?: string;

  public static mapToAPI(unite: Unite | undefined): UniteAPI | undefined {
    if (unite) {
      return {
        abreviation: unite.abreviation,
        long: unite.long,
      };
    }
  }
}

export class ReponseUniqueAPI {
  @ApiProperty() value: string;
  @ApiProperty({ type: UniteAPI, required: false }) unite?: Unite;

  public static mapToAPI(reponse: KYCReponseSimple): ReponseUniqueAPI {
    return {
      unite: UniteAPI.mapToAPI(reponse.unite),
      value: reponse.value,
    };
  }
}
export class ReponseMultipleAPI {
  @ApiProperty() code: string;
  @ApiProperty() label: string;
  @ApiProperty({ required: false }) value?: string;
  @ApiProperty({ required: false }) selected?: boolean;
  @ApiProperty({ required: false }) emoji?: string;
  @ApiProperty({ required: false }) image_url?: string;
  @ApiProperty({ type: UniteAPI, required: false }) unite?: UniteAPI;
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

  @ApiProperty()
  is_skipped: boolean;

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
      is_answered: question.is_answered,
      is_skipped: question.is_skipped,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    if (question.isSimpleQuestion()) {
      result.reponse_unique = {
        value: question.getReponseSimpleValue(),
        unite: UniteAPI.mapToAPI(question.getUnite()),
      };
    } else if (question.isChoixQuestion()) {
      result.reponse_multiple = question.reponse_complexe.map((r) => ({
        code: r.code,
        label: r.label,
        selected: r.selected,
      }));
    } else if (question.isMosaic()) {
      result.reponse_multiple = question.reponse_complexe.map((r) => {
        const common = {
          code: r.code,
          label: r.label,
          emoji: r.emoji,
          image_url: r.image_url,
          unite: UniteAPI.mapToAPI(r.unite),
        };
        if (question.type === TypeReponseQuestionKYC.mosaic_boolean) {
          return {
            ...common,
            selected: r.selected,
          };
        } else {
          return {
            ...common,
            value: r.value,
          };
        }
      });
    }
    return result;
  }
}
