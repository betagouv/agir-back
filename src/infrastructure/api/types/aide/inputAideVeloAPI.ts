import { ApiProperty } from '@nestjs/swagger';

export class InputAideVeloAPI {
  @ApiProperty({
    description: "Prix d'achat du vélo",
    type: 'number',
    required: true,
  })
  prix_du_velo: number;

  @ApiProperty({
    description: 'État du vélo : neuf ou occasion',
    enum: ['neuf', 'occasion'],
    default: 'neuf',
    required: false,
  })
  etat_du_velo: 'neuf' | 'occasion' = 'neuf';

  @ApiProperty({
    description: "Est-ce que l'utilisateur est en situation de handicap ?",
    default: false,
    required: false,
  })
  situation_handicap: boolean = false;
}
