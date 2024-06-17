import { Versioned } from '../versioned';
import {
  FavorisRecherche,
  ServiceRecherche,
  ServiceRechercheID,
} from '../../bibliotheque_services/serviceRecherche';
import { BibliothequeServices } from '../../bibliotheque_services/bibliothequeServices';

export class FavorisRecherche_v0 {
  id: string;
  date: Date;

  static map(fav: FavorisRecherche): FavorisRecherche_v0 {
    return {
      id: fav.id,
      date: fav.date,
    };
  }
}
export class ServiceRecherche_v0 {
  id: ServiceRechercheID;
  favoris: FavorisRecherche_v0[];

  static map(service: ServiceRecherche): ServiceRecherche_v0 {
    return {
      id: service.id,
      favoris: service.favoris
        ? service.favoris.map((f) => FavorisRecherche_v0.map(f))
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
