import { ApiProperty } from '@nestjs/swagger';
import { ResultatRecherche } from '../../../../../src/domain/bibliotheque_services/resultatRecherche';
import { Day } from '../../../../domain/bibliotheque_services/days';
import { FruitLegume } from '../../../service/fruits/fruitEtLegumesServiceManager';

export class OpenHourAPI {
  @ApiProperty({ enum: Day }) jour: Day;
  @ApiProperty() heures: string;
}
export class IngredientAPI {
  @ApiProperty() ordre: number;
  @ApiProperty() quantite: number;
  @ApiProperty() poids: number;
  @ApiProperty() poids_net: number;
  @ApiProperty() unite: string;
  @ApiProperty() nom: string;
}
export class ResultatRechercheAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() adresse_rue: string;
  @ApiProperty() adresse_nom_ville: string;
  @ApiProperty() adresse_code_postal: string;
  @ApiProperty() site_web: string;
  @ApiProperty() est_favoris: boolean;
  @ApiProperty() nombre_favoris: number;
  @ApiProperty() impact_carbone_kg: number;
  @ApiProperty() type_plat: string;
  @ApiProperty() difficulty_plat: string;
  @ApiProperty() temps_prepa_min: number;
  @ApiProperty() distance_metres: number;
  @ApiProperty() image_url: string;
  @ApiProperty() emoji: string;
  @ApiProperty({ enum: FruitLegume }) type_fruit_legume: FruitLegume;

  @ApiProperty() commitment: string;
  @ApiProperty() description: string;
  @ApiProperty() description_more: string;
  @ApiProperty() phone: string;
  @ApiProperty() categories: string[];
  @ApiProperty() openhours_more_infos: string;
  @ApiProperty({ type: [OpenHourAPI] }) open_hours: OpenHourAPI[];
  @ApiProperty() longitude: number;
  @ApiProperty() latitude: number;
  @ApiProperty({ type: [IngredientAPI] }) ingredients: IngredientAPI[];

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
      impact_carbone_kg: res.impact_carbone_kg,
      type_plat: res.type_plat,
      difficulty_plat: res.difficulty_plat,
      temps_prepa_min: res.temps_prepa_min,
      distance_metres: res.distance_metres,
      image_url: res.image_url,
      emoji: res.emoji,
      type_fruit_legume: res.type_fruit_legume,
      commitment: res.commitment,
      description: res.description,
      description_more: res.description_more,
      phone: res.phone,
      categories: res.categories,
      openhours_more_infos: res.openhours_more_infos,
      open_hours: res.open_hours,
      latitude: res.latitude,
      longitude: res.longitude,
      ingredients: res.ingredients,
    };
  }
}
