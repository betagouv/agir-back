import { ApiProperty } from '@nestjs/swagger';

export class ValiderPseudoAPI {
  @ApiProperty({ required: true })
  pseudo: string;

  @ApiProperty({ required: true })
  id: string;
}
