import { FavorisRecherche_v0 } from '../../object_store/service/BibliothequeService_v0';
import { ResultatRecherche } from './resultatRecherche';

export class FavorisRecherche {
  date_ajout: Date;
  resulat_recherche: ResultatRecherche;

  constructor(fav: FavorisRecherche_v0) {
    this.date_ajout = fav.date_ajout;
    if (fav.resulat_recherche) {
      this.resulat_recherche = new ResultatRecherche(fav.resulat_recherche);
    }
  }

  public static new(resultat: ResultatRecherche) {
    const fav = new FavorisRecherche({
      date_ajout: new Date(),
      resulat_recherche: null,
    });
    fav.resulat_recherche = resultat;
    return fav;
  }
}
