import { ApiProperty } from '@nestjs/swagger';
import { ServiceDefinition } from '../../../../../src/domain/service/serviceDefinition';
import { Thematique } from '../../../../../src/domain/thematique';

export class ServiceDefinitionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() image_url: string;
  @ApiProperty() is_local: boolean;
  @ApiProperty() is_url_externe: boolean;

  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];

  @ApiProperty() nombre_installation: number;

  static mapServiceDefintionToServiceDefinitionAPI(
    serviceDefinition: ServiceDefinition,
  ): ServiceDefinitionAPI {
    return {
      id: serviceDefinition.id,
      titre: serviceDefinition.titre,
      url: serviceDefinition.url,
      icon_url: serviceDefinition.icon_url,
      image_url: serviceDefinition.image_url,
      is_local: serviceDefinition.is_local,
      is_url_externe: serviceDefinition.is_url_externe,
      thematiques: serviceDefinition.thematiques,
      nombre_installation: serviceDefinition.nombre_installation,
    };
  }
}
