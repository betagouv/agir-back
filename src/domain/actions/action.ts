import { AideDefinition } from '../aides/aideDefinition';
import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../bibliotheque_services/recherche/serviceRechercheID';
import { Article } from '../contenu/article';
import { Quizz } from '../contenu/quizz';
import { FAQDefinition } from '../faq/FAQDefinition';
import { QuestionKYC } from '../kyc/questionKYC';
import { ActionDefinition } from './actionDefinition';

export class ActionService {
  recherche_service_id: ServiceRechercheID;
  categorie: CategorieRecherche;
}

export class Action extends ActionDefinition {
  private aides: AideDefinition[];
  nombre_aides: number;
  nombre_actions_faites: number;
  services: ActionService[];
  quizz_liste: Quizz[];
  faq_liste: FAQDefinition[];
  article_liste: Article[];
  kycs: QuestionKYC[] | undefined;
  nom_commune?: string;
  deja_vue?: boolean;
  deja_faite?: boolean;
  vue_le?: Date;
  faite_le?: Date;

  constructor(data: ActionDefinition) {
    super(data);
    this.aides = [];
    this.services = [];
    this.quizz_liste = [];
    this.faq_liste = [];
    this.article_liste = [];
    this.nombre_aides = 0;
    this.nombre_actions_faites = 0;
  }

  public setListeAides(liste: AideDefinition[]) {
    this.aides = liste;
    this.nombre_aides = liste.length;
  }

  public getListeAides(): AideDefinition[] {
    return this.aides;
  }
}
