import { FavorisRecherche_v0 } from '../object_store/service/BibliothequeService_v0';
import { ResultatRecherche } from './resultatRecherche';

export class FavorisRecherche {
  id: string;
  date_ajout: Date;
  resulat_recherche: ResultatRecherche;

  constructor(fav: FavorisRecherche_v0) {
    this.id = fav.id;
    this.date_ajout = fav.date_ajout;
    this.resulat_recherche = new ResultatRecherche(fav.resulat_recherche);
  }
}
