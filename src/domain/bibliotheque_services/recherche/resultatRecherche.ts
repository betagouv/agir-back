import { FruitLegume } from '../../../infrastructure/service/fruits/fruitEtLegumesServiceManager';
import {
  EtapeRecette_v0,
  IngredientRecette_v0,
  ResultatRecherche_v0,
} from '../../object_store/service/BibliothequeService_v0';
import { OpenHour } from '../types/openHour';

export class IngredientRecette {
  ordre: number;
  quantite: number;
  poids: number;
  poids_net: number;
  unite: string;
  nom: string;

  constructor(res: IngredientRecette_v0) {
    Object.assign(this, res);
  }
}
export class EtapeRecette {
  ordre: number;
  texte: string;

  constructor(res: EtapeRecette_v0) {
    Object.assign(this, res);
  }
}

export class ResultatRecherche {
  id: string;
  titre: string;
  image_url?: string;
  fallback_image_url?: string;

  adresse_rue?: string;
  adresse_nom_ville?: string;
  adresse_code_postal?: string;

  site_web?: string;
  siret?: string;

  longitude?: number;
  latitude?: number;

  impact_carbone_kg?: number;

  type_plat?: string;
  difficulty_plat?: string;
  temps_prepa_min?: number;

  distance_metres?: number;

  est_favoris?: boolean;
  nombre_favoris?: number;

  emoji?: string;
  type_fruit_legume?: FruitLegume;

  commitment?: string;
  description?: string;
  description_more?: string;
  phone?: string;
  categories?: string[];
  categories_labels?: string[];
  openhours_more_infos?: string;
  open_hours?: OpenHour[];

  ingredients?: IngredientRecette[];
  etapes_recette?: EtapeRecette[];

  nbr_resultats_max_dispo?: number;

  sources_lvao?: string[];
  pourcentage?: number;
  niveau_risque?: number;
  niveau_risque_label?: string;

  constructor(res: ResultatRecherche_v0) {
    this.id = res.id;
    this.titre = res.titre;
    this.image_url = res.image_url;
    this.fallback_image_url = res.fallback_image_url;
    this.adresse_rue = res.adresse_rue;
    this.adresse_nom_ville = res.adresse_nom_ville;
    this.adresse_code_postal = res.adresse_code_postal;
    this.site_web = res.site_web;
    this.latitude = res.latitude;
    this.longitude = res.longitude;
    this.type_plat = res.type_plat;
    this.difficulty_plat = res.difficulty_plat;
    this.temps_prepa_min = res.temps_prepa_min;
    this.distance_metres = res.distance_metres;
    this.impact_carbone_kg = res.impact_carbone_kg;
    this.est_favoris = false;
    this.nombre_favoris = 0;
    this.emoji = res.emoji;
    this.type_fruit_legume = res.type_fruit_legume;

    this.commitment = res.commitment;
    this.description = res.description;
    this.description_more = res.description_more;
    this.phone = res.phone;
    this.categories = res.categories;
    this.openhours_more_infos = res.openhours_more_infos;
    this.open_hours = res.open_hours;
    this.ingredients = res.ingredients
      ? res.ingredients.map((e) => new IngredientRecette(e))
      : [];
    this.etapes_recette = res.etapes_recette
      ? res.etapes_recette.map((e) => new EtapeRecette(e))
      : [];
    this.nbr_resultats_max_dispo = res.nbr_resultats_max_dispo;
    this.sources_lvao = res.sources_lvao;
  }
}
