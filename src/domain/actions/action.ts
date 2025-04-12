import { AideDefinition } from '../aides/aideDefinition';
import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../bibliotheque_services/recherche/serviceRechercheID';
import { Article } from '../contenu/article';
import { Quizz } from '../contenu/quizz';
import { FAQDefinition } from '../faq/FAQDefinition';
import { QuestionKYC } from '../kyc/questionKYC';
import { ActionUtilisateur } from '../thematique/history/thematiqueHistory';
import { Utilisateur } from '../utilisateur/utilisateur';
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
  like_level?: number;
  feedback?: string;

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

  public static newAction(
    action_def: ActionDefinition,
    action_user: ActionUtilisateur,
  ): Action {
    const action = new Action(action_def);
    if (action_user) {
      action.deja_vue = !!action_user.vue_le;
      action.vue_le = action_user.vue_le;
      action.faite_le = action_user.faite_le;
      action.deja_faite = !!action_user.faite_le;
      action.like_level = action_user.like_level;
      action.feedback = action_user.feedback;
    } else {
      action.deja_vue = false;
      action.vue_le = null;
      action.faite_le = null;
      action.deja_faite = false;
      action.like_level = null;
      action.feedback = null;
    }
    return action;
  }

  public static newActionFromUser(
    action_def: ActionDefinition,
    user: Utilisateur,
  ): Action {
    const action_user = user.thematique_history.findAction(action_def);

    return this.newAction(action_def, action_user);
  }

  public setListeAides(liste: AideDefinition[]) {
    this.aides = liste;
    this.nombre_aides = liste.length;
  }

  public getListeAides(): AideDefinition[] {
    return this.aides;
  }
}
