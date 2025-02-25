import { AideDefinition } from '../aides/aideDefinition';
import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../bibliotheque_services/recherche/serviceRechercheID';
import { Quizz } from '../contenu/quizz';
import { ActionDefinition } from './actionDefinition';

export class ActionService {
  recherche_service_id: ServiceRechercheID;
  categorie: CategorieRecherche;
}

export class Action extends ActionDefinition {
  private aides: AideDefinition[];
  nombre_aides: number;
  services: ActionService[];
  quizz_liste: Quizz[];
  nom_commune?: string;
  deja_vue?: boolean;

  constructor(data: ActionDefinition) {
    super(data);
    this.aides = [];
    this.services = [];
    this.quizz_liste = [];
    this.nombre_aides = 0;
  }

  public setListeAides(liste: AideDefinition[]) {
    this.aides = liste;
    this.nombre_aides = liste.length;
  }
  public getListeAides(): AideDefinition[] {
    return this.aides;
  }
}
