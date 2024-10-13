import { ApiProperty } from '@nestjs/swagger';

export class ValiderPrenomAPI {
  @ApiProperty({ required: true })
  prenom: string;

  @ApiProperty({ required: true })
  id: string;
}
