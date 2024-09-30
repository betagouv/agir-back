import { ApplicationError } from '../../../infrastructure/applicationError';
import { ServiceRecherche_v0 } from '../../object_store/service/BibliothequeService_v0';
import { FavorisRecherche } from './favorisRecherche';
import { ResultatRecherche } from './resultatRecherche';
import { ServiceRechercheID } from './serviceRechercheID';

export class ServiceRecherche {
  id: ServiceRechercheID;
  favoris: FavorisRecherche[];
  derniere_recherche: ResultatRecherche[];

  constructor(service?: ServiceRecherche_v0) {
    this.id = service.id;
    this.favoris = [];
    this.derniere_recherche = [];
    if (service.favoris) {
      this.favoris = service.favoris.map((fav) => new FavorisRecherche(fav));
    }

    if (service && service.derniere_recherche) {
      this.derniere_recherche = service.derniere_recherche.map(
        (s) => new ResultatRecherche(s),
      );
    }
  }

  public existeDerniereRecherche(): boolean {
    return this.derniere_recherche.length > 0;
  }

  public getLastResultatById(resultId: string): ResultatRecherche {
    return this.derniere_recherche.find((r) => r.id === resultId);
  }
  public ajouterFavoris(result_id: string) {
    const resultat_a_favoriser = this.derniere_recherche.find(
      (r) => r.id === result_id,
    );

    if (!resultat_a_favoriser) {
      ApplicationError.throwUnkonwnSearchResult(this.id, result_id);
    }

    let favoris_existant = this.favoris.find(
      (f) => f.resulat_recherche.id === result_id,
    );

    if (favoris_existant) {
      favoris_existant.date_ajout = new Date();
      favoris_existant.resulat_recherche = resultat_a_favoriser;
    } else {
      const new_favoris = FavorisRecherche.new(resultat_a_favoriser);
      this.favoris.push(new_favoris);
    }
  }

  public supprimerFavoris(result_id: string) {
    let favoris_existant_index = this.favoris.findIndex(
      (f) => f.resulat_recherche.id === result_id,
    );

    if (favoris_existant_index > -1) {
      this.favoris.splice(favoris_existant_index, 1);
    }
  }

  public estFavoris(fav_id: string): boolean {
    return !!this.favoris.find((f) => f.resulat_recherche.id === fav_id);
  }

  public static new(serviceId: ServiceRechercheID): ServiceRecherche {
    return new ServiceRecherche({
      id: serviceId,
      favoris: [],
      derniere_recherche: [],
    });
  }

  public setDerniereRecherche(recherche: ResultatRecherche[]) {
    this.derniere_recherche = recherche;
  }
}
