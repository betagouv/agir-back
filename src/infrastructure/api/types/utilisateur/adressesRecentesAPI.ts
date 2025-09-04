import { ApiProperty } from '@nestjs/swagger';
import { Adresse } from '../../../../domain/logement/adresse';
import { CommuneRepository } from '../../../repository/commune/commune.repository';

export class AdressesRecentesInputAPI {
  @ApiProperty() code_commune: string;
  @ApiProperty() code_postal: string;
  @ApiProperty() numero_rue: string;
  @ApiProperty() rue: string;
  @ApiProperty() longitude: number;
  @ApiProperty() latitude: number;
}

export class AdressesRecentesAPI {
  @ApiProperty() id: string;
  @ApiProperty() code_commune: string;
  @ApiProperty() commmune: string;
  @ApiProperty() code_postal: string;
  @ApiProperty() numero_rue: string;
  @ApiProperty() rue: string;
  @ApiProperty() longitude: number;
  @ApiProperty() latitude: number;
  @ApiProperty() date_creation: Date;

  public static mapToAPI(adresse: Adresse): AdressesRecentesAPI {
    return {
      id: adresse.id,
      code_commune: adresse.code_commune,
      code_postal: adresse.code_postal,
      numero_rue: adresse.numero_rue,
      rue: adresse.rue,
      longitude: adresse.longitude,
      latitude: adresse.latitude,
      commmune: CommuneRepository.getLibelleCommuneLowerCase(
        adresse.code_commune,
      ),
      date_creation: adresse.date_creation,
    };
  }
}
