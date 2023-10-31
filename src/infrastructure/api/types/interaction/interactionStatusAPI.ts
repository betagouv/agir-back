import { ApiProperty } from '@nestjs/swagger';

export class InteractionStatusAPI {
  @ApiProperty({ required: false })
  seen?: number;

  @ApiProperty({ required: false })
  clicked?: boolean;

  @ApiProperty({ required: false })
  done?: boolean;

  @ApiProperty({ required: false, description: 'valeur entière de 0 à 100' })
  quizz_score?: number;
}
