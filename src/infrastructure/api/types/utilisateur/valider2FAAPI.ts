import { ApiProperty } from '@nestjs/swagger';

export class Valider2FAAPI {
  @ApiProperty()
  email: string;
  @ApiProperty()
  code: string;
}
