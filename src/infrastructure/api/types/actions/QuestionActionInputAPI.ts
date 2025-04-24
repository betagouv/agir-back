import { ApiProperty } from '@nestjs/swagger';
import { ActionUsecase } from '../../../../usecase/actions.usecase';

export class QuestionActionInputAPI {
  @ApiProperty({ required: true, maxLength: ActionUsecase.MAX_QUESTION_LENGTH })
  question: string;
}
