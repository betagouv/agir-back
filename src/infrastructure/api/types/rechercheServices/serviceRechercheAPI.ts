import { ApiProperty } from '@nestjs/swagger';
import { ServiceExterneID } from '../../../../domain/bibliotheque_services/serviceExterneID';
import { ServiceRechercheDefinition } from '../../../../domain/bibliotheque_services/serviceRechercheDefinition';
import { ServiceRechercheID } from '../../../../domain/bibliotheque_services/serviceRechercheID';

export class ServiceRechercheAPI {
  @ApiProperty({ enum: ServiceRechercheID }) id_service:
    | ServiceRechercheID
    | ServiceExterneID;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() univers: string;
  @ApiProperty() external_url: string;
  @ApiProperty() is_available_inhouse: boolean;

  public static mapToAPI(
    service: ServiceRechercheDefinition,
  ): ServiceRechercheAPI {
    return {
      id_service: service.id,
      titre: service.titre,
      sous_titre: service.sous_titre,
      external_url: service.external_url,
      icon_url: service.icon_url,
      univers: service.univers,
      is_available_inhouse: service.is_available_inhouse,
    };
  }
}
