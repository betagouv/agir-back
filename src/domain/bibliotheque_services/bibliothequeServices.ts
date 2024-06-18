import { BibliothequeServices_v0 } from '../object_store/service/BibliothequeService_v0';
import { ServiceRecherche } from './serviceRecherche';

export class BibliothequeServices {
  liste_services: ServiceRecherche[];

  constructor(biblio: BibliothequeServices_v0) {
    this.liste_services = [];
    if (biblio.liste_services) {
      this.liste_services = biblio.liste_services.map(
        (s) => new ServiceRecherche(s),
      );
    }
  }
}
