import { ApiProperty } from '@nestjs/swagger';

export class ConnectPRMByAddressAPI {
  @ApiProperty()
  nom: string;

  @ApiProperty()
  rue: string;

  @ApiProperty()
  code_commune: string;

  @ApiProperty()
  code_postal: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty() numero_rue: string;
}
