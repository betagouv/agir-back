import { ApiProperty } from '@nestjs/swagger';
import {
  Chauffage,
  Consommation,
  Repas,
  Residence,
  Superficie,
  Transport,
} from '../../../../domain/utilisateur/onboarding';
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
  @ApiProperty({
    enum: [
      'superficie_35',
      'superficie_70',
      'superficie_100',
      'superficie_150',
      'superficie_150_et_plus',
    ],
  })
  superficie?: Superficie;
  @ApiProperty({ enum: ['electricite', 'bois', 'fioul', 'gaz', 'autre'] })
  chauffage?: Chauffage;
  @ApiProperty({ enum: ['tout', 'vege', 'vegan', 'viande'] })
  repas?: Repas;
  @ApiProperty({
    enum: ['raisonnable', 'secondemain', 'shopping', 'jamais'],
  })
  consommation?: Consommation;
}
