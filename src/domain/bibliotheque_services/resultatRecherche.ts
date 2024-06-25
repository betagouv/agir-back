import { ResultatRecherche_v0 } from '../object_store/service/BibliothequeService_v0';

export class ResultatRecherche {
  id: string;
  titre: string;

  adresse_rue: string;
  adresse_nom_ville: string;
  adresse_code_postal: string;

  site_web: string;

  constructor(res: ResultatRecherche_v0) {
    this.id = res.id;
    this.titre = res.titre;
    this.adresse_rue = res.adresse_rue;
    this.adresse_nom_ville = res.adresse_nom_ville;
    this.adresse_code_postal = res.adresse_code_postal;
    this.site_web = res.site_web;
  }
}
