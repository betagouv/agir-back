import { ApiProperty } from '@nestjs/swagger';

export class ValidateCodeAPI {
  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  code: string;
}
