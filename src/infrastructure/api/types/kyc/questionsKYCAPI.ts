import { ApiProperty } from '@nestjs/swagger';
import { Categorie } from '../../../../../src/domain/contenu/categorie';
import {
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../domain/kyc/questionKYC';

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
  @ApiProperty()
  thematique?: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI {
    let result: QuestionKYCAPI = {
      id: question.code,
      question: question.question,
      reponse: undefined,
      reponses_possibles: undefined,
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      is_NGC: question.is_NGC,
      thematique: question.thematique,
    };

    result.reponses_possibles = question.listeLabelsReponseComplexe();

    if (question.isSimpleQuestion()) {
      result.reponse = [question.getReponseSimpleValue()];
    }
    if (question.isChoixQuestion()) {
      result.reponse = question.getSelectedLabels();
    }

    return result;
  }
}
