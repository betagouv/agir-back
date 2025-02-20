import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { Thematique } from '../contenu/thematique';
import { TypeAction } from './typeAction';

export class ActionDefinition {
  cms_id: string;
  code: string;
  titre: string;
  sous_titre: string;
  quizz_felicitations: string;
  besoins: string[];
  comment: string;
  pourquoi: string;
  kyc_ids: string[];
  lvo_action: CategorieRecherche;
  lvo_objet: string;
  quizz_ids: string[];
  recette_categorie: CategorieRecherche;
  type: TypeAction;
  thematique: Thematique;

  constructor(data: ActionDefinition) {
    Object.assign(this, data);
  }
}
