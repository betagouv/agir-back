import { ApiProperty } from '@nestjs/swagger';
import { CollectiviteAPI } from './AidesVeloParTypeAPI';
import { AideVeloNonCalculee } from 'src/domain/aides/aideVelo';

export class AideVeloNonCalculeeAPI {
  @ApiProperty()
  libelle: string;

  @ApiProperty()
  lien: string;

  @ApiProperty({ type: CollectiviteAPI })
  collectivite: CollectiviteAPI;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  logo?: string;

  public static mapToAPI(
    aideVelo: AideVeloNonCalculee,
  ): AideVeloNonCalculeeAPI {
    return {
      libelle: aideVelo.libelle,
      lien: aideVelo.lien,
      collectivite: CollectiviteAPI.mapToAPI(aideVelo.collectivite),
      description: aideVelo.description,
      logo: aideVelo.logo,
    };
  }
}
