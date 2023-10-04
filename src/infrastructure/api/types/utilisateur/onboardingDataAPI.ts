import { ApiProperty } from '@nestjs/swagger';
import {
  Chauffage,
  Consommation,
  Repas,
  Residence,
  Superficie,
  Transport,
} from '../../../../../src/domain/utilisateur/onboardingData';
export class OnboardingDataAPI {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: ['voiture', 'moto', 'pied', 'velo', 'commun'],
    },
  })
  transports?: Transport[];
  @ApiProperty({ type: 'integer' })
  avion?: number;
  @ApiProperty()
  code_postal?: string;
  @ApiProperty()
  adultes?: number;
  @ApiProperty()
  enfants?: number;
  @ApiProperty({ enum: ['maison', 'appartement'] })
  residence?: Residence;
  @ApiProperty()
  proprietaire?: boolean;
  @ApiProperty({ enum: ['petit', 'moyen', 'grand', 'tres_grand'] })
  superficie?: Superficie;
  @ApiProperty({ enum: ['electricite', 'bois', 'fioul', 'gaz', 'autre', '?'] })
  chauffage?: Chauffage;
  @ApiProperty({ enum: ['tout', 'vege', 'vegan', 'viande'] })
  repas?: Repas;
  @ApiProperty({
    enum: ['raisonnable', 'secondemain', 'shopping', 'jamais'],
  })
  consommation?: Consommation;
}
