import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../domain/kyc/questionKYC';

export class ReponseKYCMosaicAPI {
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
  @ApiProperty({ type: [String] })
  reponses_possibles?: string[];
  @ApiProperty({ type: [ReponseKYCMosaicAPI] })
  reponses_mosaic: ReponseKYCMosaicAPI[];
  @ApiProperty()
  thematique?: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI {
    let result: QuestionKYCAPI = {
      id: question.id,
      question: question.question,
      reponse: question.listeReponsesLabels(),
      reponses_possibles: undefined,
      reponses_mosaic: undefined,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    if (question.type === TypeReponseQuestionKYC.mosaic_boolean) {
      result.reponses_mosaic = question.reponses_possibles.map((r) => ({
        code: r.code,
        label: r.label,
        value_boolean: r.value_boolean,
        value_number: r.value_number,
      }));
    } else {
      result.reponses_possibles = question.listeReponsesPossiblesLabels();
    }

    return result;
  }
}
