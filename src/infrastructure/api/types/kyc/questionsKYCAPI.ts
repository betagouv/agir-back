import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import {
  KYCReponse,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../domain/kyc/questionKYC';

class ReponseKYCMosaicAPI {
  @ApiProperty()
  code: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  value_boolean: boolean;

  @ApiProperty()
  value_number: number;
}

export class QuestionKYCAPI {
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
  @ApiProperty({ type: [String] })
  reponse: string[];
  @ApiProperty({ type: [ReponseKYCMosaicAPI] })
  reponse_mosaic: ReponseKYCMosaicAPI[];
  @ApiProperty({ type: [String] })
  reponses_possibles?: string[];
  @ApiProperty({ type: [ReponseKYCMosaicAPI] })
  reponses_possibles_mosaic: ReponseKYCMosaicAPI[];
  @ApiProperty()
  thematique?: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI {
    let result: QuestionKYCAPI = {
      id: question.id,
      question: question.question,
      reponse: undefined,
      reponse_mosaic: undefined,
      reponses_possibles: undefined,
      reponses_possibles_mosaic: undefined,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    if (question.type === TypeReponseQuestionKYC.mosaic_boolean) {
      result.reponses_possibles_mosaic = this.mapBooleanMosaicReponses(
        question.reponses_possibles,
      );
      result.reponse_mosaic = this.mapBooleanMosaicReponses(question.reponses);
    } else if (question.type === TypeReponseQuestionKYC.mosaic_number) {
      result.reponses_possibles_mosaic = this.mapNumberMosaicReponses(
        question.reponses_possibles,
      );
      result.reponse_mosaic = this.mapNumberMosaicReponses(question.reponses);
    } else {
      result.reponses_possibles = question.listeReponsesPossiblesLabels();
      result.reponse = question.listeReponsesLabels();
    }

    return result;
  }

  private static mapBooleanMosaicReponses(
    rep: KYCReponse[],
  ): ReponseKYCMosaicAPI[] {
    if (!rep) return [];
    return rep.map((r) => ({
      code: r.code,
      label: r.label,
      value_boolean: r.value_boolean,
      value_number: undefined,
    }));
  }
  private static mapNumberMosaicReponses(
    rep: KYCReponse[],
  ): ReponseKYCMosaicAPI[] {
    if (!rep) return [];
    return rep.map((r) => ({
      code: r.code,
      label: r.label,
      value_boolean: undefined,
      value_number: r.value_number,
    }));
  }
}
