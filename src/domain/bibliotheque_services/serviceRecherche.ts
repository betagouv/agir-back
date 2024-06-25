import { ServiceRecherche_v0 } from '../object_store/service/BibliothequeService_v0';
import { FavorisRecherche } from './favorisRecherche';
import { ServiceRechercheID } from './serviceRechercheID';

export class ServiceRecherche {
  id: ServiceRechercheID;
  favoris: FavorisRecherche[];

  constructor(service: ServiceRecherche_v0) {
    this.id = service.id;
    this.favoris = [];
    if (service.favoris) {
      this.favoris = service.favoris.map((fav) => new FavorisRecherche(fav));
    }
  }x
}
