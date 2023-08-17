import { ApiProperty } from '@nestjs/swagger';

export class QuestionNGC {
  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;
}
