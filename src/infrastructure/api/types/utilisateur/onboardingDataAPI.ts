import { ApiProperty } from '@nestjs/swagger';

export class OnboardingDataAPI {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: ['voiture', 'moto', 'pied', 'velo', 'commun'],
    },
  })
  transports?: string[];
  @ApiProperty({ type: 'integer' })
  avion?: number;
  @ApiProperty()
  code_postal?: string;
  @ApiProperty()
  adultes?: number;
  @ApiProperty()
  enfants?: number;
  @ApiProperty({ enum: ['maison', 'appartement'] })
  residence?: 'maison' | 'appartement';
  @ApiProperty()
  proprietaire?: boolean;
  @ApiProperty({ enum: ['petit', 'moyen', 'grand'] })
  superficie?: 'petit' | 'moyen' | 'grand';
  @ApiProperty({ enum: ['electricite', 'bois', 'fioul', 'gaz', 'autre', '?'] })
  chauffage?: 'electricite' | 'bois' | 'fioul' | 'gaz' | 'autre' | '?';
  @ApiProperty({ enum: ['tout', 'vege', 'vegan', 'viande'] })
  repas?: 'tout' | 'vege' | 'vegan' | 'viande';
  @ApiProperty({
    enum: ['raisonnable', 'secondemain', 'shopping', 'jamais'],
  })
  consommation?: 'raisonnable' | 'secondemain' | 'shopping' | 'jamais';
}
