import { BibliothequeServices_v0 } from '../object_store/service/BibliothequeService_v0';
import { ResultatRecherche } from './recherche/resultatRecherche';
import { ServiceRecherche } from './recherche/serviceRecherche';
import { ServiceRechercheID } from './recherche/serviceRechercheID';

export class BibliothequeServices {
  liste_services: ServiceRecherche[];

  constructor(biblio?: BibliothequeServices_v0) {
    this.liste_services = [];
    if (biblio && biblio.liste_services) {
      this.liste_services = biblio.liste_services.map(
        (s) => new ServiceRecherche(s),
      );
    }
  }

  public setDerniereRecherche(
    serviceId: ServiceRechercheID,
    recherche: ResultatRecherche[],
  ) {
    let service = this.getServiceById(serviceId);
    if (!service) {
      service = ServiceRecherche.new(serviceId);
      this.liste_services.push(service);
    }
    service.setDerniereRecherche(recherche);
  }

  public getServiceById(serviceId: ServiceRechercheID): ServiceRecherche {
    return this.liste_services.find((s) => s.id === serviceId);
  }
}
