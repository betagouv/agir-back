import { Versioned } from '../versioned';
import { ServiceRecherche } from '../../bibliotheque_services/serviceRecherche';
import { BibliothequeServices } from '../../bibliotheque_services/bibliothequeServices';
import { ServiceRechercheID } from '../../../../src/domain/bibliotheque_services/serviceRechercheID';
import {
  IngredientRecette,
  ResultatRecherche,
} from '../../../../src/domain/bibliotheque_services/resultatRecherche';
import { FavorisRecherche } from 'src/domain/bibliotheque_services/favorisRecherche';
import { FruitLegume } from '../../../infrastructure/service/fruits/fruitEtLegumesServiceManager';
import { OpenHour } from '../../bibliotheque_services/openHour';

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

  adresse_rue?: string;
  adresse_nom_ville?: string;
  adresse_code_postal?: string;

  site_web?: string;

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

export class BibliothequeServices_v0 extends Versioned {
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
