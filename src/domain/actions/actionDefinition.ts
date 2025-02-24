import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { Thematique } from '../thematique/thematique';
import { TypeAction } from './typeAction';

export type TypeCode = {
  type: TypeAction;
  code: string;
};

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

  public static getIdFromTypeCode?(type_code: TypeCode): string {
    return type_code.type + '_' + type_code.code;
  }

  public getTypeCodeId?(): string {
    return this.type + '_' + this.code;
  }
  public getTypeCode?(): TypeCode {
    return { code: this.code, type: this.type };
  }
}
