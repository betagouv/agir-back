import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { ServiceDefinition } from '../../../../../src/domain/service/serviceDefinition';
import { Thematique } from '../../../../domain/contenu/thematique';

export class ServiceDefinitionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() image_url: string;
  @ApiProperty() description: string;
  @ApiProperty() sous_description: string;
  @ApiProperty() en_construction: boolean;
  @ApiProperty() is_local: boolean;
  @ApiProperty() is_url_externe: boolean;
  @ApiProperty() is_installed?: boolean;
  @ApiProperty() parametrage_requis: boolean;

  @ApiProperty({ type: [String] })
  thematiques: string[];

  @ApiProperty() nombre_installation: number;

  public static mapServiceDefintionToServiceDefinitionAPI(
    serviceDefinition: ServiceDefinition,
    isAdmin: boolean,
  ): ServiceDefinitionAPI {
    let result = {
      id: serviceDefinition.serviceDefinitionId,
      titre: serviceDefinition.titre,
      url: serviceDefinition.url,
      icon_url: serviceDefinition.icon_url,
      image_url: serviceDefinition.image_url,
      is_local: serviceDefinition.is_local,
      is_url_externe: serviceDefinition.is_url_externe,
      description: serviceDefinition.description,
      sous_description: serviceDefinition.sous_description,
      en_construction: ServiceDefinitionAPI.isEnConstruction(
        serviceDefinition,
        isAdmin,
      ),
      thematiques: ServiceDefinitionAPI.convertThematiquesListeToLibelleListe(
        serviceDefinition.thematiques,
      ),
      nombre_installation: serviceDefinition.nombre_installation,
      is_installed: serviceDefinition.is_installed,
      parametrage_requis: serviceDefinition.parametrage_requis,
    };
    return result;
  }

  private static isEnConstruction(
    serviceDefinition: ServiceDefinition,
    isAdmin: boolean,
  ) {
    if (isAdmin) return false;
    return serviceDefinition.isEnConstruction();
  }

  public static convertThematiquesListeToLibelleListe(
    thematiques: Thematique[],
  ): string[] {
    return thematiques.map((thematique) =>
      ThematiqueRepository.getLibelleThematique(thematique),
    );
  }
}
