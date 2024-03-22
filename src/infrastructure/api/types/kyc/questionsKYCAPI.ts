import { ApiProperty } from '@nestjs/swagger';
import {
  CategorieQuestionKYC,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../../../domain/kyc/questionQYC';

export class QuestionKYCAPI {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TypeReponseQuestionKYC })
  type: TypeReponseQuestionKYC;
  @ApiProperty({ enum: CategorieQuestionKYC })
  categorie: CategorieQuestionKYC;

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

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI {
    return {
      id: question.id,
      question: question.question,
      reponse: question.listeReponsesLabels(),
      categorie: question.categorie,
      points: question.points,
      type: question.type,
      reponses_possibles: question.listeReponsesPossiblesLabels(),
      is_NGC: question.is_NGC,
    };
  }
}
