import { ApiProperty } from '@nestjs/swagger';

export class InputAideVeloAPI {
  @ApiProperty() prix_du_velo: number;
  @ApiProperty({
    enum: ['neuf', 'occasion'],
    default: 'neuf',
    required: false,
  })
  etat_du_velo: 'neuf' | 'occasion' = 'neuf';
}
