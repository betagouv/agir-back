import { ApiProperty } from '@nestjs/swagger';

export class InputAideVeloOpenAPI {
  @ApiProperty({ description: `code insee d'une commune ou d'une EPCI` })
  code_insee: string;
  @ApiProperty({
    description: `prix du vélo en euros, 1000€ par défaut`,
    required: false,
  })
  prix_du_velo: number;
  @ApiProperty({
    description: `revenu fiscal de référence, 40000€ par défaut`,
    required: false,
  })
  rfr: number;
  @ApiProperty({
    description: `nombre de parts dans le foyer fiscal, 2 par défaut`,
    required: false,
  })
  @ApiProperty()
  parts: number;
  @ApiProperty({
    enum: ['neuf', 'occasion'],
    default: 'neuf',
    required: false,
    description: `aide ciblant l'achat de vélo neuf ou d'occasion`,
  })
  etat_du_velo: 'neuf' | 'occasion' = 'neuf';
}
