import {
  FavorisRecherche_v0,
  ServiceRecherche_v0,
} from '../object_store/service/BibliothequeService_v0';

export enum ServiceRechercheID {
  proximite = 'proximite',
}

export class FavorisRecherche {
  id: string;
  date: Date;

  constructor(fav: FavorisRecherche_v0) {
    Object.assign(this, fav);
  }
}

export class ServiceRecherche {
  id: ServiceRechercheID;
  favoris: FavorisRecherche[];

  constructor(service: ServiceRecherche_v0) {
    this.id = service.id;
    this.favoris = [];
    if (service.favoris) {
      this.favoris = service.favoris.map((fav) => new FavorisRecherche(fav));
    }
  }
}
