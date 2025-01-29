import { ApiProperty } from '@nestjs/swagger';

export class InputAideVeloAPI_v2 {
  @ApiProperty() prix_du_velo: number;
  @ApiProperty({
    enum: ['neuf', 'occasion'],
    default: 'neuf',
  })
  etat_du_velo: 'neuf' | 'occasion';
}
