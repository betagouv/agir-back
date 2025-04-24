import { ApiProperty } from '@nestjs/swagger';
import { ActionUsecase } from '../../../../usecase/actions.usecase';

export class FeedbackActionInputAPI {
  @ApiProperty({ required: false, pattern: `^[1234]$` })
  like_level: number;

  @ApiProperty({
    required: false,
    maxLength: ActionUsecase.MAX_FEEDBACK_LENGTH,
  })
  feedback: string;
}
