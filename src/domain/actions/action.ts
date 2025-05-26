import { AideDefinition } from '../aides/aideDefinition';
import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../bibliotheque_services/recherche/serviceRechercheID';
import { Article } from '../contenu/article';
import { Quizz } from '../contenu/quizz';
import { FAQDefinition } from '../faq/FAQDefinition';
import { QuestionKYC } from '../kyc/questionKYC';
import { ExplicationScore } from '../scoring/system_v2/ExplicationScore';
import { Tag_v2 } from '../scoring/system_v2/Tag_v2';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { ActionUtilisateur } from '../thematique/history/thematiqueHistory';
import { Thematique } from '../thematique/thematique';
import { Utilisateur } from '../utilisateur/utilisateur';
import { ActionDefinition } from './actionDefinition';
import { TypeAction } from './typeAction';

export class ActionService {
  recherche_service_id: ServiceRechercheID;
  categorie: CategorieRecherche;
}

export class Action extends ActionDefinition implements TaggedContent {
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
  enchainement_id?: string;
  liste_partages?: Date[];
  score: number;
  explicationScore: ExplicationScore;

  constructor(action_def: ActionDefinition) {
    super(action_def);
    this.aides = [];
    this.services = [];
    this.quizz_liste = [];
    this.faq_liste = [];
    this.article_liste = [];
    this.nombre_aides = 0;
    this.nombre_actions_faites = 0;
    this.score = 0;
    this.explicationScore = new ExplicationScore();
    if (
      action_def.type === TypeAction.bilan ||
      action_def.type === TypeAction.simulateur
    ) {
      this.enchainement_id = action_def.getTypeCodeAsString();
    }
  }

  getThematique(): Thematique {
    return this.thematique;
  }
  getTags(): Tag[] {
    return [];
  }
  getInclusionTags(): Tag_v2[] {
    return this.tags_a_inclure.map((t) => Tag_v2[t]);
  }
  getExclusionTags(): Tag_v2[] {
    return this.tags_a_exclure.map((t) => Tag_v2[t]);
  }
  getDistinctText(): string {
    return this.cms_id;
  }
  isLocal(): boolean {
    return false;
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
      action.liste_partages = action_user.liste_partages;
    } else {
      action.deja_vue = false;
      action.vue_le = null;
      action.faite_le = null;
      action.deja_faite = false;
      action.like_level = null;
      action.feedback = null;
      action.liste_partages = [];
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
