import { ApiProperty } from '@nestjs/swagger';

export class QuestionNGCAPI {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;
}
