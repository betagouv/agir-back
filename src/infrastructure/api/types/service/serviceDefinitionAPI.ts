import { ApiProperty } from '@nestjs/swagger';
import { ServiceDefinition } from 'src/domain/serviceDefinition';

export class ServiceDefinitionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() local: boolean;
  @ApiProperty() is_url_externe: boolean;

  static mapServiceDefintionToServiceDefinitionAPI(
    serviceDefinition: ServiceDefinition,
  ): ServiceDefinitionAPI {
    return {
      id: serviceDefinition.id,
      titre: serviceDefinition.titre,
      url: serviceDefinition.url,
      local: serviceDefinition.local,
      is_url_externe: serviceDefinition.is_url_externe,
    };
  }
}
