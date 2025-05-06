import { ApiProperty } from '@nestjs/swagger';
import { RisquesNaturelsCommunesDefinition } from '../../../../domain/logement/RisquesNaturelsCommuneDefinition';

export class RisquesCommuneAPI {
  @ApiProperty() code_commune: string;
  @ApiProperty() nom_commune: string;
  @ApiProperty() nombre_catastrophes_naturels: number;
  @ApiProperty() pourcentage_commune_risque_secheresse_geotechnique: number;
  @ApiProperty() pourcentage_commune_risque_inondation: number;

  static mapToAPI(
    risque: RisquesNaturelsCommunesDefinition,
  ): RisquesCommuneAPI {
    return {
      code_commune: risque.code_commune,
      nom_commune: risque.nom_commune,
      nombre_catastrophes_naturels: risque.nombre_cat_nat,
      pourcentage_commune_risque_inondation:
        risque.pourcentage_risque_innondation,
      pourcentage_commune_risque_secheresse_geotechnique:
        risque.pourcentage_risque_secheresse,
    };
  }
}
