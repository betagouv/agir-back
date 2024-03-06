import { ApiProperty } from '@nestjs/swagger';
import { Onboarding_v0 } from '../../../../../../src/domain/object_store/Onboarding/onboarding_v0';
import {
  TypeLogement,
  Superficie,
  Chauffage,
} from '../../../../../../src/domain/utilisateur/logement';
import {
  Consommation,
  Repas,
  TransportOnboarding,
} from '../../../../../domain/utilisateur/onboarding/onboarding';

export class OnboardingDataAPI {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      enum: Object.keys(TransportOnboarding),
    },
  })
  transports: TransportOnboarding[];
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
  @ApiProperty({ enum: TypeLogement })
  residence: TypeLogement;
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

  public static convertToDomain(data: OnboardingDataAPI): Onboarding_v0 {
    return {
      version: 0,
      adultes: data.adultes,
      avion: data.avion,
      chauffage: data.chauffage,
      code_postal: data.code_postal,
      commune: data.commune,
      consommation: data.consommation,
      enfants: data.enfants,
      proprietaire: data.proprietaire,
      repas: data.repas,
      residence: data.residence,
      superficie: data.superficie,
      transports: data.transports,
    };
  }
}
