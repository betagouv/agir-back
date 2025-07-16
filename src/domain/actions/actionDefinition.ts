import { Besoin } from '../aides/besoin';
import {
  CategorieRecherche,
  SousCategorieRecherche,
} from '../bibliotheque_services/recherche/categorieRecherche';
import { Source } from '../contenu/source';
import { SousThematique } from '../thematique/sousThematique';
import { Thematique } from '../thematique/thematique';
import { TypeAction } from './typeAction';

const POINTS: Record<TypeAction, number> = {
  bilan: 50,
  classique: 100,
  quizz: 20,
  simulateur: 30,
};

export type TypeCodeAction = {
  type: TypeAction;
  code: string;
};

export class ActionDefinitionData {
  cms_id: string;
  code: string;
  titre: string;
  titre_recherche: string;
  sous_titre: string;
  consigne: string;
  label_compteur: string;
  quizz_felicitations: string;
  besoins: Besoin[];
  comment: string;
  pourquoi: string;
  kyc_codes: string[];
  faq_ids: string[];
  lvo_action: CategorieRecherche;
  lvo_objet: string;
  article_ids: string[];
  quizz_ids: string[];
  recette_categorie: CategorieRecherche;
  recette_sous_categorie: SousCategorieRecherche;
  pdcn_categorie: CategorieRecherche;
  type: TypeAction;
  thematique: Thematique;
  sous_thematique: SousThematique;
  tags_a_inclure: string[];
  tags_a_exclure: string[];
  sources: Source[];
  VISIBLE_PROD: boolean;
  emoji: string;
  external_id: string;
}

export class ActionDefinition extends ActionDefinitionData {
  constructor(data: ActionDefinitionData) {
    super();
    Object.assign(this, data);
  }

  public static getIdFromTypeCode(type_code: TypeCodeAction): string {
    return '' + type_code.type + '_' + type_code.code;
  }

  public static getTypeCodeFromString(type_code: string): TypeCodeAction {
    if (!type_code) {
      return { code: undefined, type: undefined };
    }
    const separateur = type_code.indexOf('_');
    return {
      type: TypeAction[type_code.substring(0, separateur)],
      code: type_code.slice(separateur + 1),
    };
  }

  public getTypeCodeAsString(): string {
    return this.type + '_' + this.code;
  }
  public getTypeCode(): TypeCodeAction {
    return { code: this.code, type: this.type };
  }

  public static extractTypeCodeFrom(type_code: TypeCodeAction): TypeCodeAction {
    return { code: type_code.code, type: type_code.type };
  }

  public equals(type_code: TypeCodeAction): boolean {
    return this.code === type_code.code && this.type === type_code.type;
  }

  public getNombrePoints(): number {
    return POINTS[this.type];
  }
  public static getNombrePointsOfTypeAction(type: TypeAction): number {
    return POINTS[type];
  }
}
