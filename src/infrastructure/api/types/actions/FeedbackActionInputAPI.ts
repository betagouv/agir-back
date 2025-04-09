import { ApiProperty } from '@nestjs/swagger';

export class FeedbackActionInputAPI {
  @ApiProperty({ required: false })
  like_level: number;

  @ApiProperty({ required: false })
  feedback: string;
}
