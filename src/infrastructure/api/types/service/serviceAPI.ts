import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service/service';
import { ServiceDefinitionAPI } from './serviceDefinitionAPI';

export class ServiceAPI extends ServiceDefinitionAPI {
  @ApiProperty() label: string;
  @ApiProperty() error_code?: string;
  @ApiProperty() configuration: Object;
  @ApiProperty() is_configured: boolean;
  @ApiProperty() is_activated: boolean;
  @ApiProperty() is_fully_running: boolean;

  public static mapServicesToServicesAPI(
    service: Service,
    isAdmin: boolean,
  ): ServiceAPI {
    const result: ServiceAPI = {
      ...ServiceDefinitionAPI.mapServiceDefintionToServiceDefinitionAPI(
        service,
        isAdmin,
      ),
      label: service.dynamic_data.label || service.titre,
      configuration: service.configuration,
      is_configured: service.is_configured,
      is_activated: service.is_activated,
      is_fully_running: service.is_fully_running,
    };
    if (service.isInError()) {
      result.error_code = service.getErrorCode();
    }
    return result;
  }
}
