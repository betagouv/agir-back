import { AideDefinition } from '../aides/aideDefinition';
import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../bibliotheque_services/recherche/serviceRechercheID';
import { ActionDefinition } from './actionDefinition';

export class ActionService {
  recherche_service_id: ServiceRechercheID;
  categorie: CategorieRecherche;
}

export class Action extends ActionDefinition {
  aides: AideDefinition[];
  services: ActionService[];

  constructor(data: ActionDefinition) {
    super(data);
    this.aides = [];
    this.services = [];
  }
}
