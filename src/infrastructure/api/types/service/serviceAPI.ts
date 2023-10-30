import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service';

export class ServiceAPI {
  @ApiProperty() id: string;
  @ApiProperty() label: string;
  @ApiProperty() titre: string;
  @ApiProperty() url?: string;
  @ApiProperty() is_url_externe?: boolean;
  @ApiProperty() local: boolean;

  static mapServicesToServicesAPI(service: Service): ServiceAPI {
    return {
      id: service.id,
      label: service.label,
      titre: service.titre,
      url: service.url,
      local: service.local,
      is_url_externe: service.is_url_externe,
    };
  }
}
