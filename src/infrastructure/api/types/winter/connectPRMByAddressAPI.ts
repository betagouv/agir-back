import { ApiProperty } from '@nestjs/swagger';

export class ConnectPRMByAddressAPI {
  @ApiProperty()
  nom: string;

  @ApiProperty()
  adresse: string;

  @ApiProperty()
  code_postal: string;

  @ApiProperty()
  code_commune: string;
}
