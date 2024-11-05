import { ApiProperty } from '@nestjs/swagger';
import { ServiceExterneID } from '../../../../domain/bibliotheque_services/serviceExterneID';
import { NewServiceDefinition } from '../../../../domain/bibliotheque_services/newServiceDefinition';
import { ServiceRechercheID } from '../../../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { ServiceAsyncID } from '../../../../domain/bibliotheque_services/serviceAsyncID';
import { Thematique } from '../../../../domain/contenu/thematique';

export class ServiceRechercheAPI {
  @ApiProperty({ enum: ServiceRechercheID }) id_service:
    | ServiceRechercheID
    | ServiceExterneID
    | ServiceAsyncID;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() univers: string; // A SUPPRIMER
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() external_url: string;
  @ApiProperty() is_available_inhouse: boolean;

  public static mapToAPI(service: NewServiceDefinition): ServiceRechercheAPI {
    return {
      id_service: service.id,
      titre: service.titre,
      sous_titre: service.sous_titre,
      external_url: service.external_url,
      icon_url: service.icon_url,
      univers: service.thematique,
      thematique: service.thematique,
      is_available_inhouse: service.is_available_inhouse,
    };
  }
}
