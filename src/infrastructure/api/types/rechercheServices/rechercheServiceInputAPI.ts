import { ApiProperty } from '@nestjs/swagger';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';

export class RechercheServiceInputAPI {
  @ApiProperty({ required: false, enum: CategorieRecherche })
  categorie: CategorieRecherche;
  @ApiProperty({ required: false }) nombre_max_resultats: number;
  @ApiProperty({ required: false }) rayon_metres: number;
  @ApiProperty({ required: false }) latitude: number;
  @ApiProperty({ required: false }) longitude: number;
  @ApiProperty({ required: false }) latitude_depart: number;
  @ApiProperty({ required: false }) longitude_depart: number;
  @ApiProperty({ required: false }) latitude_arrivee: number;
  @ApiProperty({ required: false }) longitude_arrivee: number;
  @ApiProperty({ required: false }) distance_metres: number;
  @ApiProperty({ required: false }) code_commune: string;
}
