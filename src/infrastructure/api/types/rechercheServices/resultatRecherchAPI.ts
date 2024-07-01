import { ApiProperty } from '@nestjs/swagger';
import { ResultatRecherche } from '../../../../../src/domain/bibliotheque_services/resultatRecherche';

export class ResultatRechercheAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() adresse_rue: string;
  @ApiProperty() adresse_nom_ville: string;
  @ApiProperty() adresse_code_postal: string;
  @ApiProperty() site_web: string;
  @ApiProperty() est_favoris: boolean;
  @ApiProperty() nombre_favoris: number;

  public static mapToAPI(res: ResultatRecherche): ResultatRechercheAPI {
    return {
      id: res.id,
      titre: res.titre,
      adresse_code_postal: res.adresse_code_postal,
      adresse_nom_ville: res.adresse_nom_ville,
      adresse_rue: res.adresse_rue,
      site_web: res.site_web,
      est_favoris: res.est_favoris,
      nombre_favoris: res.nombre_favoris,
    };
  }
}
