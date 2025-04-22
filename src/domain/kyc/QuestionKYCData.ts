import { Categorie } from '../contenu/categorie';
import { QuestionKYC_v2 } from '../object_store/kyc/kycHistory_v2';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { Thematique } from '../thematique/thematique';
import { ConditionKYC } from './conditionKYC';
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
  is_mosaic_answered?: boolean;
  is_answered?: boolean;
  tags: Tag[];
  score: number;
  // TODO: should use the generated DottedName instead of string
  ngc_key?: string;
  protected reponse_simple: KYCReponseSimple;
  protected reponse_complexe: KYCReponseComplexe[];
  protected conditions: AndConditionSet[];

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
      : undefined;
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

  public touch() {
    this.last_update = new Date();
  }
}
