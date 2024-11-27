import { ApplicationError } from '../../infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v2 } from '../object_store/kyc/kycHistory_v2';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { ConditionKYC } from './conditionKYC';
import { KycDefinition } from './kycDefinition';
import { MosaicKYCDef, TypeMosaic } from './mosaicKYC';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  entier = 'entier',
  decimal = 'decimal',

  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',

  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
}

const TRUE_STRING = [
  'true',
  'True',
  'TRUE',
  'yes',
  'Yes',
  'YES',
  'oui',
  'Oui',
  'OUI',
  '1',
];

export enum BooleanKYC {
  oui = 'oui',
  non = 'non',
}
export enum Unite {
  kg = 'kg',
  g = 'l',
  km = 'km',
  l = 'l',
  euro = 'euro',
}

export class KYCReponse {
  code: string;
  label: string;
  ngc_code?: string;
  value?: string;
}

export type AndConditionSet = ConditionKYC[];

export type KYCReponseSimple = {
  value: string;
  unite?: Unite;
};
export type KYCReponseComplexe = {
  code: string;
  label: string;
  selected: boolean;
  value?: string;
  ngc_code?: string;
  image_url?: string;
  emoji?: string;
  unite?: Unite;
};

export class QuestionKYC implements TaggedContent {
  code: string;
  id_cms: number;
  question: string;
  short_question: string;
  emoji: string;
  image_url: string;
  unite: Unite;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  thematique: Thematique;
  thematiques: Thematique[];
  points: number;
  is_NGC: boolean;
  a_supprimer: boolean;
  is_mosaic_answered?: boolean;
  is_answererd?: boolean;
  tags: Tag[];
  score: number;
  ngc_key?: string;
  private reponse_simple: KYCReponseSimple;
  private reponse_complexe: KYCReponseComplexe[];
  private conditions: AndConditionSet[];

  constructor(data?: QuestionKYC_v2) {
    if (!data) return;
    this.code = data.code;
    this.id_cms = data.id_cms;
    this.question = data.question;
    this.short_question = data.short_question;
    this.emoji = data.emoji;
    this.unite = data.unite;
    this.image_url = data.image_url;
    this.type = data.type;
    this.categorie = data.categorie;
    this.points = data.points;
    this.is_NGC = data.is_NGC;
    this.ngc_key = data.ngc_key;
    this.thematique = data.thematique;
    this.tags = data.tags ? data.tags : [];
    this.score = 0;
    this.conditions = data.conditions ? data.conditions : [];
    this.a_supprimer = !!data.a_supprimer;

    this.reponse_simple = data.reponse_simple;
    this.reponse_complexe = data.reponse_complexe
      ? data.reponse_complexe.map((r) => ({
          code: r.code,
          label: r.label,
          ngc_code: r.ngc_code,
          value: r.value,
          selected: r.selected,
          emoji: undefined,
          image_url: undefined,
          unite: undefined,
        }))
      : undefined;
  }

  public static buildFromDef(def: KycDefinition): QuestionKYC {
    const result = new QuestionKYC({
      categorie: def.categorie,
      code: def.code,
      id_cms: def.id_cms,
      is_NGC: def.is_ngc,
      points: def.points,
      tags: def.tags,
      type: def.type,
      ngc_key: def.ngc_key,
      thematique: def.thematique,
      question: def.question,
      conditions: def.conditions ? def.conditions : [],
      a_supprimer: !!def.a_supprimer,
      reponse_simple: null,
      reponse_complexe: null,
      emoji: def.emoji,
      image_url: def.image_url,
      short_question: def.short_question,
      unite: def.unite,
    });
    result.is_answererd = false;

    if (
      def.type === TypeReponseQuestionKYC.choix_unique ||
      def.type === TypeReponseQuestionKYC.choix_multiple
    ) {
      result.reponse_complexe = [];
      for (const reponse of def.reponses) {
        result.reponse_complexe.push({
          label: reponse.label,
          code: reponse.code,
          ngc_code: reponse.ngc_code,
          selected: false,
        });
      }
    } else {
      result.reponse_simple = {
        unite: def.unite,
        value: undefined,
      };
    }

    return result;
  }

  public static buildFromMosaicDef(
    def: MosaicKYCDef,
    liste_kyc: QuestionKYC[],
  ): QuestionKYC {
    const result = new QuestionKYC({
      id_cms: undefined,
      question: def.titre,
      thematique: def.thematique,
      categorie: def.categorie,
      code: def.id,
      points: def.points,
      type:
        def.type === TypeMosaic.mosaic_boolean
          ? TypeReponseQuestionKYC.mosaic_boolean
          : TypeReponseQuestionKYC.mosaic_number,
      is_NGC: false,
      tags: [],
      conditions: [],
      a_supprimer: false,
      reponse_simple: undefined,
      reponse_complexe: undefined,
    });
    if (def.type === TypeMosaic.mosaic_boolean) {
      result.reponse_complexe =
        QuestionKYC.buildBooleanResponseListe(liste_kyc);
    }

    return result;
  }

  private static buildBooleanResponseListe(
    kyc_liste: QuestionKYC[],
  ): KYCReponseComplexe[] {
    const liste_reponses: KYCReponseComplexe[] = [];
    for (const kyc of kyc_liste) {
      let value: string;
      let selected: boolean;
      if (kyc.hasAnyResponses()) {
        if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
          value =
            kyc.getCodeReponseQuestionChoixUnique() === 'oui' ? 'oui' : 'non';
          selected = kyc.getCodeReponseQuestionChoixUnique() === 'oui';
        } else if (kyc.type === TypeReponseQuestionKYC.entier) {
          value = kyc.getReponseSimpleValue() === '1' ? 'oui' : 'non';
          selected = kyc.getReponseSimpleValue() === '1';
        }
      } else {
        value = 'non';
        selected = false;
      }
      liste_reponses.push({
        code: kyc.code,
        value: value,
        selected: selected,
        label: kyc.short_question,
        image_url: kyc.image_url,
        unite: kyc.unite,
        emoji: kyc.emoji,
        ngc_code: undefined,
      });
    }
    return liste_reponses;
  }

  public refreshFromDef(def: KycDefinition) {
    if (
      def.type === TypeReponseQuestionKYC.choix_unique ||
      def.type === TypeReponseQuestionKYC.choix_multiple
    ) {
      const updated_set: KYCReponseComplexe[] = [];
      for (const def_reponse of def.reponses) {
        const current_rep = this.getQuestionComplexeByCode(def_reponse.code);
        if (current_rep) {
          current_rep.ngc_code = def_reponse.ngc_code;
          current_rep.label = def_reponse.label;
          updated_set.push(current_rep);
        } else {
          updated_set.push({
            code: def_reponse.code,
            label: def_reponse.label,
            ngc_code: def_reponse.ngc_code,
            selected: false,
          });
        }
      }
      this.reponse_complexe = updated_set;
    } else {
      if (this.reponse_simple) {
        this.reponse_simple.unite = def.unite;
      }
    }

    this.question = def.question;
    this.type = def.type;
    this.categorie = def.categorie;
    this.points = def.points;
    this.is_NGC = def.is_ngc;
    this.a_supprimer = !!def.a_supprimer;
    this.ngc_key = def.ngc_key;
    this.thematique = def.thematique;
    this.tags = def.tags ? def.tags : [];
    this.conditions = def.conditions ? def.conditions : [];
    this.id_cms = def.id_cms;
    this.emoji = def.emoji;
    this.image_url = def.image_url;
    this.unite = def.unite;
    this.short_question = def.short_question;
  }

  public isSimpleQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.decimal ||
      this.type === TypeReponseQuestionKYC.libre ||
      this.type === TypeReponseQuestionKYC.entier
    );
  }
  public isChoixQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.choix_unique ||
      this.type === TypeReponseQuestionKYC.choix_multiple
    );
  }
  public isChoixUnique(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_unique;
  }
  public isChoixMultiple(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_multiple;
  }

  public hasConditions() {
    return this.conditions && this.conditions.length > 0;
  }

  public hasAnyResponses(): boolean {
    return this.hasAnySimpleResponse() || this.hasAnyComplexeResponse();
  }
  public hasAnySimpleResponse(): boolean {
    if (this.reponse_simple && this.reponse_simple.value) {
      return true;
    }
    return false;
  }
  public hasAnyComplexeResponse(): boolean {
    if (this.reponse_complexe) {
      for (const reponse of this.reponse_complexe) {
        if (reponse.value) return true;
        if (reponse.selected) return true;
      }
    }
    return false;
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  public getDistinctText(): string {
    return this.question;
  }
  public isLocal(): boolean {
    return false;
  }

  public static isTrueBooleanString(str: string): boolean {
    return TRUE_STRING.includes(str);
  }
  public isMosaic(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.mosaic_boolean ||
      this.type === TypeReponseQuestionKYC.mosaic_number
    );
  }

  public getConditions(): AndConditionSet[] {
    if (this.hasConditions()) return this.conditions;
    return [];
  }

  public isSelectedReponseCode(code: string): boolean {
    if (!this.hasAnyComplexeResponse()) {
      return false;
    }
    const found = this.reponse_complexe.find((r) => r.code === code);
    return found ? found.selected : false;
  }

  public listeReponseValues(): string[] {
    if (this.reponse_simple && this.reponse_simple.value) {
      return [this.reponse_simple.value];
    }
    if (this.reponse_complexe) {
      return this.reponse_complexe.map((r) => r.value).filter((v) => !!v);
    }
    return [];
  }
  public getCodeReponseQuestionChoixUnique(): string {
    if (!this.hasAnyComplexeResponse()) return null;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.code;
      }
    }
    return null;
  }
  public getNGCCodeReponseQuestionChoixUnique(): string {
    if (!this.hasAnyComplexeResponse()) return null;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.ngc_code;
      }
    }
    return null;
  }

  public getNombreReponsesPossibles(): number {
    if (!this.hasAnyComplexeResponse()) return 0;
    return this.reponse_complexe.length;
  }
  public getReponseComplexeByCode(code: string): KYCReponseComplexe {
    if (!this.reponse_complexe || !(this.reponse_complexe.length > 0))
      return null;
    return this.reponse_complexe.find((r) => r.code === code);
  }
  public getRAWListeReponsesComplexes(): KYCReponseComplexe[] {
    return this.reponse_complexe ? this.reponse_complexe : [];
  }
  public getRAWReponseSimple(): KYCReponseSimple {
    return this.reponse_simple;
  }
  public getReponseSimpleValueAsNumber(): number {
    if (this.reponse_simple && this.reponse_simple.value) {
      return Number(this.reponse_simple.value);
    }
    return null;
  }

  public getReponseSimpleValue(): string {
    if (this.reponse_simple) {
      return this.reponse_simple.value;
    }
    return undefined;
  }

  public setReponseSimpleValue(value: string) {
    this.reponse_simple.value = value;
  }

  public getReponseSimpleUnite(): Unite {
    if (this.reponse_simple) {
      return this.reponse_simple.unite;
    }
    return undefined;
  }

  // DEPRECATED
  public listeLabelsReponseComplexe() {
    if (this.reponse_complexe) {
      return this.reponse_complexe.map((e) => e.label);
    } else {
      return [];
    }
  }

  // DEPRECATED
  public setResponseWithValueOrLabels(reponses: string[]) {
    this.throwExceptionIfReponseNotExists(reponses);

    if (this.isSimpleQuestion()) {
      if (reponses && reponses.length === 1) {
        this.reponse_simple = { value: reponses[0] };
      }
    } else if (this.isChoixUnique()) {
      this.setChoixUniqueByLabel(reponses[0]);
    } else if (this.isChoixMultiple()) {
      this.deSelectAll();
      for (const rep of reponses) {
        this.selectChoixByLabel(rep);
      }
    }
  }

  // DEPRECATED
  private selectChoixByLabel(label: string) {
    if (!this.reponse_complexe) return;
    for (const rep of this.reponse_complexe) {
      if (rep.label === label) {
        rep.selected = true;
        return;
      }
    }
  }
  // DEPRECATED
  private setChoixUniqueByLabel(label: string) {
    if (!this.reponse_complexe) return;
    for (const rep of this.reponse_complexe) {
      rep.selected = rep.label === label;
    }
  }

  private deSelectAll() {
    if (!this.reponse_complexe) return;
    for (const rep of this.reponse_complexe) {
      rep.selected = false;
    }
  }

  public getSelectedLabels(): string[] {
    if (!this.reponse_complexe) return [];
    const result = [];
    for (const rep of this.reponse_complexe) {
      if (rep.selected) {
        result.push(rep.label);
      }
    }
    return result;
  }

  public getSelectedCodes(): string[] {
    if (!this.reponse_complexe) return [];
    const result = [];
    for (const rep of this.reponse_complexe) {
      if (rep.selected) {
        result.push(rep.code);
      }
    }
    return result;
  }

  public selectChoixUniqueByCode(code: string) {
    if (!this.reponse_complexe) return;
    for (const rep of this.reponse_complexe) {
      rep.selected = rep.code === code;
    }
  }
  public setChoixByCode(code: string, selected: boolean) {
    if (!this.reponse_complexe) return;
    for (const rep of this.reponse_complexe) {
      if (rep.code === code) {
        rep.selected = selected;
        return;
      }
    }
  }

  private getQuestionComplexeByCode(code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.code === code);
  }
  private getQuestionComplexeByLabel(label: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.label === label);
  }
  private getQuestionComplexeByNgcCode(ngc_code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.ngc_code === ngc_code);
  }

  // DEPRECATED
  private throwExceptionIfReponseNotExists(reponses: string[]) {
    if (
      this.type !== TypeReponseQuestionKYC.choix_multiple &&
      this.type !== TypeReponseQuestionKYC.choix_unique
    ) {
      return;
    }
    for (const reponse_label of reponses) {
      const code = this.getCodeByLabel(reponse_label);
      if (!code) {
        ApplicationError.throwBadResponseValue(reponse_label, this.code);
      }
    }
  }

  public getAllCodes(): string[] {
    if (!this.reponse_complexe) {
      return [];
    }
    return this.reponse_complexe.map((r) => r.code);
  }

  public getCodeByLabel(label: string): string {
    if (!this.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByLabel(label);
    return q ? q.code : null;
  }
  public getCodeByNGCCode(ngc_code: string): string {
    if (!this.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByNgcCode(ngc_code);
    return q ? q.code : null;
  }

  public static getProgression(liste: QuestionKYC[]): {
    current: number;
    target: number;
  } {
    let progression = 0;
    for (const question of liste) {
      if (question.isMosaic()) {
        if (question.is_mosaic_answered) {
          progression++;
        }
      } else if (question.hasAnyResponses()) {
        progression++;
      }
    }
    return { current: progression, target: liste.length };
  }
}
