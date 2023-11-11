import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service/service';
import { ServiceDefinitionAPI } from './serviceDefinitionAPI';

export class ServiceAPI extends ServiceDefinitionAPI {
  @ApiProperty() label: string;
  @ApiProperty() isInError: boolean;

  public static mapServicesToServicesAPI(service: Service): ServiceAPI {
    return {
      ...ServiceDefinitionAPI.mapServiceDefintionToServiceDefinitionAPI(
        service,
      ),
      label: service.dynamic_data.label || service.titre,
      isInError: service.dynamic_data.isInError,
    };
  }
}
