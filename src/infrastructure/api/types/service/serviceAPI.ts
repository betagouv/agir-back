import { ApiProperty } from '@nestjs/swagger';
import { Service } from '../../../../domain/service/service';
import { ServiceDefinitionAPI } from './serviceDefinitionAPI';

export class ServiceAPI {
  @ApiProperty() id: string;
  @ApiProperty() label: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() image_url: string;
  @ApiProperty() description: string;
  @ApiProperty() sous_description: string;
  @ApiProperty() is_url_externe?: boolean;
  @ApiProperty() is_local: boolean;
  @ApiProperty({ type: [String] })
  thematiques: string[];

  static mapServicesToServicesAPI(service: Service): ServiceAPI {
    return {
      id: service.serviceDefinitionId,
      label: service.label,
      titre: service.titre,
      url: service.url,
      icon_url: service.icon_url,
      image_url: service.image_url,
      is_local: service.is_local,
      is_url_externe: service.is_url_externe,
      description: service.description,
      sous_description: service.sous_description,
      thematiques: ServiceDefinitionAPI.convertThematiquesListeToLibelleListe(
        service.thematiques,
      ),
    };
  }
}
