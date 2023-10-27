import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service';

export class ServiceAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() local: boolean;

  static mapServicesToServicesAPI(services: Service[]): ServiceAPI[] {
    if (!services) return [];
    return services.map((service) => {
      return {
        titre: service.serviceDefinition.titre,
        url: service.serviceDefinition.url,
        local: service.serviceDefinition.local,
      } as ServiceAPI;
    });
  }
}
