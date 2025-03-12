import { CategorieRecherche } from '../bibliotheque_services/recherche/categorieRecherche';
import { TagExcluant } from '../scoring/tagExcluant';
import { Thematique } from '../thematique/thematique';
import { TypeAction } from './typeAction';

export type TypeCodeAction = {
  type: TypeAction;
  code: string;
};

export class ActionDefinitionData {
  cms_id: string;
  code: string;
  titre: string;
  sous_titre: string;
  consigne: string;
  label_compteur: string;
  quizz_felicitations: string;
  besoins: string[];
  comment: string;
  pourquoi: string;
  kyc_codes: string[];
  faq_ids: string[];
  lvo_action: CategorieRecherche;
  lvo_objet: string;
  quizz_ids: string[];
  recette_categorie: CategorieRecherche;
  type: TypeAction;
  thematique: Thematique;
  tags_excluants: TagExcluant[];
}

export class ActionDefinition extends ActionDefinitionData {
  constructor(data: ActionDefinitionData) {
    super();
    Object.assign(this, data);
  }

  public static getIdFromTypeCode(type_code: TypeCodeAction): string {
    return type_code.type + '_' + type_code.code;
  }

  public static getTypeCodeFromString(type_code: string): TypeCodeAction {
    const separateur = type_code.indexOf('_');
    return {
      type: TypeAction[type_code.substring(0, separateur)],
      code: type_code.slice(separateur + 1),
    };
  }

  public getTypeCodeId(): string {
    return this.type + '_' + this.code;
  }
  public getTypeCode(): TypeCodeAction {
    return { code: this.code, type: this.type };
  }

  public equals(type_code: TypeCodeAction): boolean {
    return this.code === type_code.code && this.type === type_code.type;
  }
}
