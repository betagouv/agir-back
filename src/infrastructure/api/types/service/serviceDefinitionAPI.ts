import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import {
  ServiceDefinition,
  ServiceDynamicData,
} from '../../../../../src/domain/service/serviceDefinition';
import { Thematique } from '../../../../../src/domain/thematique';

export class ServiceDefinitionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() icon_url: string;
  @ApiProperty() image_url: string;
  @ApiProperty() description: string;
  @ApiProperty() sous_description: string;
  @ApiProperty() is_local: boolean;
  @ApiProperty() is_url_externe: boolean;
  @ApiProperty() is_installed?: boolean;
  @ApiProperty() dynamic_data: ServiceDynamicData;

  @ApiProperty({ type: [String] })
  thematiques: string[];

  @ApiProperty() nombre_installation: number;

  public static mapServiceDefintionToServiceDefinitionAPI(
    serviceDefinition: ServiceDefinition,
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
      thematiques: ServiceDefinitionAPI.convertThematiquesListeToLibelleListe(
        serviceDefinition.thematiques,
      ),
      nombre_installation: serviceDefinition.nombre_installation,
      is_installed: serviceDefinition.is_installed,
      dynamic_data: serviceDefinition.dynamic_data,
    };
    return result;
  }

  public static convertThematiquesListeToLibelleListe(
    thematiques: Thematique[],
  ): string[] {
    return thematiques.map((thematique) =>
      ThematiqueRepository.getLibelleThematique(thematique),
    );
  }
}
