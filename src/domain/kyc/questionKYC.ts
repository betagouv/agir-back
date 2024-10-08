import { ApplicationError } from '../../infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { ConditionKYC } from './conditionKYC';
import { KycDefinition } from './kycDefinition';

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

export class KYCReponse {
  code: string;
  label: string;
  ngc_code?: string;
}

export class QuestionKYC implements TaggedContent {
  id: string;
  id_cms: number;
  question: string;
  short_question: string;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  thematique?: Thematique;
  points: number;
  is_NGC: boolean;
  reponses?: KYCReponse[];
  reponses_possibles?: KYCReponse[];
  ngc_key?: string;
  tags: Tag[];
  score: number;
  universes: string[];
  image_url: string;
  conditions: ConditionKYC[][];

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
    this.id_cms = data.id_cms;
    this.short_question = data.short_question;
    this.image_url = data.image_url;
    this.conditions = data.conditions ? data.conditions : [];
  }

  public static buildFromDef(def: KycDefinition): QuestionKYC {
    return new QuestionKYC({
      categorie: def.categorie,
      id: def.code,
      id_cms: def.id_cms,
      is_NGC: def.is_ngc,
      points: def.points,
      tags: def.tags,
      type: def.type,
      ngc_key: def.ngc_key,
      thematique: def.thematique,
      universes: def.universes,
      question: def.question,
      reponses_possibles: def.reponses ? def.reponses : [],
      short_question: def.short_question,
      image_url: def.image_url,
      conditions: def.conditions ? def.conditions : [],
    });
  }

  public refreshFromDef(def: KycDefinition) {
    this.question = def.question;
    this.type = def.type;
    this.categorie = def.categorie;
    this.points = def.points;
    this.is_NGC = def.is_ngc;
    this.reponses_possibles = def.reponses ? def.reponses : [];
    this.ngc_key = def.ngc_key;
    this.thematique = def.thematique;
    this.tags = def.tags ? def.tags : [];
    this.universes = def.universes ? def.universes : [];
    this.conditions = def.conditions ? def.conditions : [];
    this.id_cms = def.id_cms;
    if (
      (this.type === TypeReponseQuestionKYC.choix_multiple ||
        this.type === TypeReponseQuestionKYC.choix_unique) &&
      this.hasAnyResponses()
    ) {
      const upgraded_set = [];
      for (const response of this.reponses) {
        const def_reponse = def.getReponseByCode(response.code);
        if (def_reponse) {
          response.label = def_reponse.label;
          response.ngc_code = def_reponse.ngc_code;
          upgraded_set.push(response);
        }
      }
      this.reponses = upgraded_set;
    }
  }

  public hasAnyResponses(): boolean {
    return !!this.reponses && this.reponses.length > 0;
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

  public includesReponseCode(code: string): boolean {
    if (!this.hasAnyResponses()) {
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
  public getCodeReponseUniqueSaisie(): string {
    if (this.reponses && this.reponses.length === 1) {
      return this.reponses[0].code;
    }
    return null;
  }
  public listeReponsesPossiblesLabels() {
    if (this.reponses_possibles) {
      return this.reponses_possibles.map((e) => e.label);
    } else {
      return [];
    }
  }

  public getLabelByCode(code: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.code === code);
    return found ? found.label : null;
  }

  public setResponses(reponses: string[]) {
    this.checkReponseExists(reponses);
    this.reponses = [];
    reponses.forEach((label) => {
      this.reponses.push({
        label: label,
        code: this.getCodeByLabel(label),
        ngc_code: this.getNGCCodeByLabel(label),
      });
    });
  }
  public setResponseByCode(code: string) {
    if (this.type !== TypeReponseQuestionKYC.choix_unique) return;
    const reponse = this.getReponsePossibleByCodeOrException(code);
    this.reponses = [];
    this.reponses.push({
      label: reponse.label,
      code: code,
      ngc_code: reponse.ngc_code,
    });
  }

  private checkReponseExists(reponses: string[]) {
    if (
      this.type !== TypeReponseQuestionKYC.choix_multiple &&
      this.type !== TypeReponseQuestionKYC.choix_unique
    ) {
      return;
    }
    for (const reponse_label of reponses) {
      const code = this.getCodeByLabel(reponse_label);
      if (!code) {
        ApplicationError.throwBadResponseValue(reponse_label, this.id);
      }
    }
  }

  public getCodeByLabel(label: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.label === label);
    return found ? found.code : null;
  }
  public getCodeByNGCCode(ngc_code: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.ngc_code === ngc_code);
    return found ? found.code : null;
  }

  private getNGCCodeByLabel(label: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.label === label);
    return found ? found.ngc_code : null;
  }

  private getReponsePossibleByCodeOrException(code: string): KYCReponse {
    const found = this.reponses_possibles.find((q) => q.code === code);
    if (!found) ApplicationError.throwBadResponseCode(this.question, code);
    return found;
  }
  private getNGCCodeByCode(code: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.code === code);
    return found ? found.ngc_code : null;
  }
}
