import { ApiProperty } from '@nestjs/swagger';
import { CategorieRechercheManager } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { Day } from '../../../../domain/bibliotheque_services/types/days';
import { NiveauRisqueNat } from '../../../repository/services_recherche/maif/maifAPIClient';
import { FruitLegume } from '../../../service/fruits/fruitEtLegumesServiceManager';

export class OpenHourAPI {
  @ApiProperty({ enum: Day }) jour: Day;
  @ApiProperty() heures: string;
}
export class EtapeRecetteAPI {
  @ApiProperty() ordre: number;
  @ApiProperty() texte: string;
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
  @ApiProperty({ type: [String] }) sources: string[];
  @ApiProperty() temps_prepa_min: number;
  @ApiProperty() distance_metres: number;
  @ApiProperty() pourcentage: number;
  @ApiProperty() image_url: string;
  @ApiProperty({
    description: 'Fallback image url in case the image_url is not available',
    type: String,
    required: false,
  })
  fallback_image_url: string | undefined;
  @ApiProperty() emoji: string;
  @ApiProperty({ enum: FruitLegume }) type_fruit_legume: FruitLegume;

  @ApiProperty({ enum: [1, 2, 3, 4, 5] }) niveau_risque?: number;
  @ApiProperty({ enum: NiveauRisqueNat })
  niveau_risque_label?: string;

  @ApiProperty() commitment: string;
  @ApiProperty() description: string;
  @ApiProperty() description_more: string;
  @ApiProperty() phone: string;
  @ApiProperty() categories: string[];
  @ApiProperty() categories_labels: string[];
  @ApiProperty() openhours_more_infos: string;
  @ApiProperty({ type: [OpenHourAPI] }) open_hours: OpenHourAPI[];
  @ApiProperty() longitude: number;
  @ApiProperty() latitude: number;
  @ApiProperty({ type: [IngredientAPI] }) ingredients: IngredientAPI[];
  @ApiProperty({ type: [EtapeRecetteAPI] }) etapes_recette: EtapeRecetteAPI[];

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
      fallback_image_url: res.fallback_image_url,
      emoji: res.emoji,
      type_fruit_legume: res.type_fruit_legume,
      commitment: res.commitment,
      description: res.description,
      description_more: res.description_more,
      phone: res.phone,
      categories: res.categories ? res.categories : [],
      openhours_more_infos: res.openhours_more_infos,
      open_hours: res.open_hours,
      latitude: res.latitude,
      longitude: res.longitude,
      ingredients: res.ingredients,
      etapes_recette: res.etapes_recette,
      categories_labels: res.categories
        ? res.categories.map((c) => CategorieRechercheManager.getLabel(c))
        : [],
      sources: res.sources_lvao,
      pourcentage: res.pourcentage,
      niveau_risque: res.niveau_risque,
      niveau_risque_label: res.niveau_risque_label,
    };
  }
}

export class ReponseRechecheAPI {
  @ApiProperty({ type: [ResultatRechercheAPI] })
  resultats: ResultatRechercheAPI[];
  @ApiProperty() encore_plus_resultats_dispo: boolean;

  public static mapToAPI(res: {
    liste: ResultatRecherche[];
    encore_plus_resultats_dispo: boolean;
  }): ReponseRechecheAPI {
    return {
      encore_plus_resultats_dispo: res.encore_plus_resultats_dispo,
      resultats: res.liste.map((r) => ResultatRechercheAPI.mapToAPI(r)),
    };
  }
}
