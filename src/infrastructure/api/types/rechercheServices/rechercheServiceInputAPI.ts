import { ApiProperty } from '@nestjs/swagger';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/categorieRecherche';

export class RechercheServiceInputAPI {
  @ApiProperty({ required: false, enum: CategorieRecherche })
  categorie: CategorieRecherche;
  @ApiProperty({ required: false }) nombre_resultats: number;
  @ApiProperty({ required: false }) rayon: number;
}
