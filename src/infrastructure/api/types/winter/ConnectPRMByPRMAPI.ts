import { ApiProperty } from '@nestjs/swagger';

export class ConnectPRMByPRMAPI {
  @ApiProperty()
  prm: string;

  @ApiProperty()
  nom: string;
}
