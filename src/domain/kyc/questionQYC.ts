import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { Univers } from '../univers/univers';
import { KycDefinition } from './kycDefinition';

export enum KYCID {
  KYC001 = 'KYC001',
  KYC002 = 'KYC002',
  KYC003 = 'KYC003',
  KYC004 = 'KYC004',
  KYC005 = 'KYC005',
  KYC006 = 'KYC006',
  KYC007 = 'KYC007',
  KYC008 = 'KYC008',
  KYC009 = 'KYC009',
  KYC010 = 'KYC010',
  KYC011 = 'KYC011',
  KYC012 = 'KYC012',
  KYC013 = 'KYC013',
  _1 = '_1',
  _2 = '_2',
  _3 = '_3',
  _4 = '_4',
  _5 = '_5',
}
export enum TypeReponseQuestionKYC {
  libre = 'libre',
  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',
  entier = 'entier',
  decimal = 'decimal',
}

export enum BooleanKYC {
  oui = 'oui',
  non = 'non',
  peut_etre = 'peut_etre',
}

export enum CategorieQuestionKYC {
  default = 'default',
  test = 'test',
  mission = 'mission',
  recommandation = 'recommandation',
}

export class KYCReponse {
  code: string;
  label: string;
}

export class QuestionKYC implements TaggedContent {
  id: KYCID;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  thematique?: Thematique;
  points: number;
  is_NGC: boolean;
  reponses?: KYCReponse[];
  reponses_possibles?: KYCReponse[];
  ngc_key?: string;
  tags: Tag[];
  score: number;
  universes: Univers[];

  constructor(data?: QuestionKYC_v0) {
    if (!data) return;
    this.id = data.id;
    this.question = data.question;
    this.type = data.type;
    this.categorie = data.categorie;
    this.points = data.points;
    this.is_NGC = data.is_NGC;
    this.reponses = data.reponses;
    this.reponses_possibles = data.reponses_possibles;
    this.ngc_key = data.ngc_key;
    this.thematique = data.thematique;
    this.tags = data.tags ? data.tags : [];
    this.score = 0;
    this.universes = data.universes ? data.universes : [];
  }

  public static buildFromDef(def: KycDefinition): QuestionKYC {
    return new QuestionKYC({
      categorie: def.categorie,
      id: def.code,
      is_NGC: def.is_ngc,
      points: def.points,
      tags: def.tags,
      type: def.type,
      ngc_key: null,
      thematique: def.thematique,
      universes: def.universes,
      question: def.question,
      reponses_possibles: def.reponses ? def.reponses : [],
    });
  }

  public hasResponses(): boolean {
    return !!this.reponses && this.reponses.length > 0;
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  public getDistinctText(): string {
    return this.question;
  }

  public includesReponseCode(code: string): boolean {
    if (!this.hasResponses()) {
      return false;
    }
    const found = this.reponses.find((r) => r.code === code);
    return !!found;
  }

  public listeReponsesLabels() {
    if (this.reponses) {
      return this.reponses.map((e) => e.label);
    } else {
      return [];
    }
  }
  public listeReponsesPossiblesLabels() {
    if (this.reponses_possibles) {
      return this.reponses_possibles.map((e) => e.label);
    } else {
      return [];
    }
  }

  public getCodeByLabel(label: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.label === label);
    return found ? found.code : null;
  }

  public getLabelByCode(code: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.code === code);
    return found ? found.label : null;
  }

  public setResponses(reponses: string[]) {
    this.reponses = [];
    reponses.forEach((element) => {
      this.reponses.push({
        label: element,
        code: this.getCodeByLabel(element),
      });
    });
  }
}
