import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service';

export class ServiceAPI {
  @ApiProperty() id: string;
  @ApiProperty() label: string;
  @ApiProperty() url?: string;
  @ApiProperty() is_url_externe?: boolean;
  @ApiProperty() local: boolean;

  static mapServicesToServicesAPI(services: Service[]): ServiceAPI[] {
    if (!services) return [];
    return services.map((service) => {
      return {
        label: service.serviceDefinition.titre,
        url: service.serviceDefinition.url,
        local: service.serviceDefinition.local,
        is_url_externe: service.serviceDefinition.is_url_externe,
      } as ServiceAPI;
    });
  }
}
