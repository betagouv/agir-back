import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service/service';
import { ServiceDefinitionAPI } from './serviceDefinitionAPI';

export class ServiceAPI extends ServiceDefinitionAPI {
  public static mapServicesToServicesAPI(service: Service): ServiceAPI {
    return {
      ...ServiceDefinitionAPI.mapServiceDefintionToServiceDefinitionAPI(
        service,
      ),
    };
  }
}
