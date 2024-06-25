import { ApiProperty } from '@nestjs/swagger';

export class RechercheServiceInputAPI {
  @ApiProperty() text: string;
}
