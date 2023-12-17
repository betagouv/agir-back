import { ApiProperty } from '@nestjs/swagger';
import { QuestionKYC } from '../../../../domain/utilisateur/questionsKYC';

export class QuestionKYCAPI {
  @ApiProperty()
  id: string;

  @ApiProperty()
  question: string;
  @ApiProperty()
  reponse: string;

  public static mapToAPI(question: QuestionKYC): QuestionKYCAPI {
    return {
      id: question.id,
      question: question.question,
      reponse: question.reponse,
    };
  }
}
