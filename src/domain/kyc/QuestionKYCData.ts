import { Categorie } from '../contenu/categorie';
import { QuestionKYC_v2 } from '../object_store/kyc/kycHistory_v2';
import { ExplicationScore } from '../scoring/system_v2/ExplicationScore';
import { Tag_v2 } from '../scoring/system_v2/Tag_v2';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { Thematique } from '../thematique/thematique';
import { ConditionKYC } from './conditionKYC';
import { KycDefinition } from './kycDefinition';
import { MosaicKYCDef, TypeMosaic } from './mosaicKYC';
import { KYCComplexValues } from './publicodesMapping';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  entier = 'entier',
  decimal = 'decimal',

  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',

  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
}

export enum BooleanKYC {
  oui = 'oui',
  non = 'non',
}

/**
 * @example
 * // CMS string: 'kg (kilogramme)'
 * { abreviation: 'kg', long: 'kilogramme'}
 *
 * // CMS string: '€/kWh (euro par kilowattheure)'
 * { abreviation: '€/kWh', long: 'euro par kilowattheure'}
 *
 * // CMS string: 'kg'
 * { abreviation: 'kg' }
 */
export type Unite = {
  abreviation: string;
  long?: string;
};

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

export type KYCReponseComplexe<ID extends keyof KYCComplexValues = '_default'> =
  {
    code: KYCComplexValues[ID]['code'];
    label: string;
    selected: boolean;
    value?: string;
    ngc_code?: KYCComplexValues[ID]['ngc_code'];
    image_url?: string;
    emoji?: string;
    unite?: Unite;
  };

export class QuestionKYCData implements TaggedContent {
  code: string;
  id_cms: number;
  last_update: Date;
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
  is_answered?: boolean;
  tags: Tag[];
  score: number;
  // TODO: should use the generated DottedName instead of string
  ngc_key?: string;
  reponse_simple: KYCReponseSimple;
  reponse_complexe: KYCReponseComplexe[];
  protected conditions: AndConditionSet[];
  explicationScore: ExplicationScore;

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
    this.explicationScore = new ExplicationScore();
    this.conditions = data.conditions ? data.conditions : [];
    this.a_supprimer = !!data.a_supprimer;
    this.last_update = data.last_update;

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
      : [];
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  public getInclusionTags(): Tag_v2[] {
    return [];
  }
  public getExclusionTags(): Tag_v2[] {
    return [];
  }

  public getDistinctText(): string {
    return this.question;
  }
  public isLocal(): boolean {
    return false;
  }

  public touch() {
    this.last_update = new Date();
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
        if (!!reponse.value) return true;
        if (!!reponse.selected) return true;
      }
    }
    return false;
  }

  public getSelectedCode(): string | undefined {
    if (!this.hasAnyComplexeResponse()) return undefined;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.code;
      }
    }
    return undefined;
  }

  public getSelectedNgcCode(): string {
    if (!this.hasAnyComplexeResponse()) return undefined;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.ngc_code;
      }
    }
    return undefined;
  }

  public getReponseSimpleValue(): string {
    if (this.reponse_simple) {
      return this.reponse_simple.value;
    }
    return undefined;
  }

  protected static buildKycFromDef(def: KycDefinition): QuestionKYCData {
    const result = new QuestionKYCData({
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
      last_update: undefined,
    });
    result.is_answered = false;

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

  protected static buildKycFromMosaicDef(
    def: MosaicKYCDef,
    liste_kyc: QuestionKYCData[],
  ): QuestionKYCData {
    const result = new QuestionKYCData({
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
      last_update: undefined,
    });
    if (def.type === TypeMosaic.mosaic_boolean) {
      result.reponse_complexe = this.buildBooleanResponseListe(liste_kyc);
    }

    return result;
  }

  public refreshFromDef(def: KycDefinition) {
    if (
      def.type === TypeReponseQuestionKYC.choix_unique ||
      def.type === TypeReponseQuestionKYC.choix_multiple
    ) {
      const updated_set: KYCReponseComplexe[] = [];
      for (const def_reponse of def.reponses) {
        const current_rep = this.getReponseByCode(def_reponse.code);
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

  private getReponseByCode(code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.code === code);
  }

  private static buildBooleanResponseListe(
    kyc_liste: QuestionKYCData[],
  ): KYCReponseComplexe[] {
    const liste_reponses: KYCReponseComplexe[] = [];
    for (const kyc of kyc_liste) {
      let value: string;
      let selected: boolean;
      if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
        if (kyc.hasAnyComplexeResponse()) {
          value = kyc.getSelectedCode() === 'oui' ? 'oui' : 'non';
          selected = kyc.getSelectedCode() === 'oui';
        } else {
          value = 'non';
          selected = false;
        }
      }
      if (kyc.type === TypeReponseQuestionKYC.entier) {
        if (kyc.hasAnySimpleResponse()) {
          value = kyc.getReponseSimpleValue() === '1' ? 'oui' : 'non';
          selected = kyc.getReponseSimpleValue() === '1';
        } else {
          value = 'non';
          selected = false;
        }
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
}
