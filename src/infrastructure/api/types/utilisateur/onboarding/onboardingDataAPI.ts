import { ApiProperty } from '@nestjs/swagger';
import {
  Chauffage,
  Consommation,
  Repas,
  Residence,
  Superficie,
  Transport,
} from '../../../../../domain/utilisateur/onboarding/onboarding';
export class OnboardingDataAPI {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.keys(Transport),
    },
  })
  transports: Transport[];
  @ApiProperty({ type: 'integer' })
  avion: number;
  @ApiProperty()
  code_postal: string;
  @ApiProperty()
  commune: string;
  @ApiProperty()
  adultes: number;
  @ApiProperty()
  enfants: number;
  @ApiProperty({ enum: Residence })
  residence: Residence;
  @ApiProperty()
  proprietaire: boolean;
  @ApiProperty({
    enum: Superficie,
  })
  superficie: Superficie;
  @ApiProperty({ enum: Chauffage })
  chauffage: Chauffage;
  @ApiProperty({ enum: Repas })
  repas: Repas;
  @ApiProperty({
    enum: Consommation,
  })
  consommation: Consommation;
}
