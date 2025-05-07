import { FruitLegume } from '../../../infrastructure/service/fruits/fruitEtLegumesServiceManager';
import { BibliothequeServices } from '../../bibliotheque_services/bibliothequeServices';
import { FavorisRecherche } from '../../bibliotheque_services/recherche/favorisRecherche';
import {
  EtapeRecette,
  IngredientRecette,
  ResultatRecherche,
} from '../../bibliotheque_services/recherche/resultatRecherche';
import { ServiceRecherche } from '../../bibliotheque_services/recherche/serviceRecherche';
import { ServiceRechercheID } from '../../bibliotheque_services/recherche/serviceRechercheID';
import { OpenHour } from '../../bibliotheque_services/types/openHour';
import { Versioned_v0 } from '../versioned';

export class EtapeRecette_v0 {
  ordre: number;
  texte: string;

  static map(res: EtapeRecette): EtapeRecette_v0 {
    return {
      ordre: res.ordre,
      texte: res.texte,
    };
  }
}
export class IngredientRecette_v0 {
  ordre: number;
  quantite: number;
  poids: number;
  poids_net: number;
  unite: string;
  nom: string;

  static map(res: IngredientRecette): IngredientRecette_v0 {
    return {
      ordre: res.ordre,
      quantite: res.quantite,
      poids: res.poids,
      poids_net: res.poids_net,
      unite: res.unite,
      nom: res.nom,
    };
  }
}

export class ResultatRecherche_v0 {
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

  type_plat?: string;
  difficulty_plat?: string;
  temps_prepa_min?: number;

  distance_metres?: number;
  impact_carbone_kg?: number;

  emoji?: string;
  type_fruit_legume?: FruitLegume;

  commitment?: string;
  description?: string;
  description_more?: string;
  phone?: string;
  categories?: string[];
  openhours_more_infos?: string;
  open_hours?: OpenHour[];
  ingredients?: IngredientRecette_v0[];
  etapes_recette?: EtapeRecette_v0[];
  nbr_resultats_max_dispo?: number;
  sources_lvao?: string[];
  surface_km_2?: number;

  static map(res: ResultatRecherche): ResultatRecherche_v0 {
    return {
      titre: res.titre,
      id: res.id,
      adresse_code_postal: res.adresse_code_postal,
      adresse_nom_ville: res.adresse_nom_ville,
      adresse_rue: res.adresse_rue,
      site_web: res.site_web,
      longitude: res.longitude,
      latitude: res.latitude,
      impact_carbone_kg: res.impact_carbone_kg,
      difficulty_plat: res.difficulty_plat,
      temps_prepa_min: res.temps_prepa_min,
      type_plat: res.type_plat,
      distance_metres: res.distance_metres,
      image_url: res.image_url,
      fallback_image_url: res.fallback_image_url,
      emoji: res.emoji,
      type_fruit_legume: res.type_fruit_legume,
      commitment: res.commitment,
      description: res.description,
      description_more: res.description_more,
      phone: res.phone,
      categories: res.categories,
      openhours_more_infos: res.openhours_more_infos,
      open_hours: res.open_hours,
      ingredients: res.ingredients
        ? res.ingredients.map((e) => IngredientRecette_v0.map(e))
        : [],
      etapes_recette: res.etapes_recette
        ? res.etapes_recette.map((e) => EtapeRecette_v0.map(e))
        : [],
      siret: res.siret,
      nbr_resultats_max_dispo: res.nbr_resultats_max_dispo,
      sources_lvao: res.sources_lvao,
      surface_km_2: res.surface_km_2,
    };
  }
}

export class FavorisRecherche_v0 {
  date_ajout: Date;
  resulat_recherche: ResultatRecherche_v0;

  static map(fav: FavorisRecherche): FavorisRecherche_v0 {
    return {
      date_ajout: fav.date_ajout,
      resulat_recherche: ResultatRecherche_v0.map(fav.resulat_recherche),
    };
  }
}

export class ServiceRecherche_v0 {
  id: ServiceRechercheID;
  favoris: FavorisRecherche_v0[];
  derniere_recherche: ResultatRecherche_v0[];

  static map(service: ServiceRecherche): ServiceRecherche_v0 {
    return {
      id: service.id,
      favoris: service.favoris
        ? service.favoris.map((f) => FavorisRecherche_v0.map(f))
        : [],
      derniere_recherche: service.derniere_recherche
        ? service.derniere_recherche.map((f) => ResultatRecherche_v0.map(f))
        : [],
    };
  }
}

export class BibliothequeServices_v0 extends Versioned_v0 {
  liste_services: ServiceRecherche_v0[];

  static serialise(biblio: BibliothequeServices): BibliothequeServices_v0 {
    return {
      version: 0,
      liste_services: biblio.liste_services
        ? biblio.liste_services.map((s) => ServiceRecherche_v0.map(s))
        : [],
    };
  }
}
