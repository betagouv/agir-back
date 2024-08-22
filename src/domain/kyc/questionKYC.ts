import { ApplicationError } from '../../infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { KycDefinition } from './kycDefinition';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',
  entier = 'entier',
  decimal = 'decimal',
  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
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
  value_boolean?: boolean;
  value_number?: number;
}
export class KYCMosaicReponse {
  code: string;
  value_boolean?: boolean;
  value_number?: number;
}

export class QuestionKYC implements TaggedContent {
  id: string;
  id_cms: number;
  question: string;
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

  public setMosaicResponses(
    mosaic: {
      code: string;
      value_number?: number;
      value_boolean?: boolean;
    }[],
  ) {
    this.reponses = [];
    this.reponses_possibles.forEach((r_possible) => {
      this.reponses.push({
        label: r_possible.label,
        code: r_possible.code,
        ngc_code: r_possible.ngc_code,
        value_number: this.getFromMosaicSingleValueOrException(
          r_possible,
          mosaic,
        ).value_number,
        value_boolean: this.getFromMosaicSingleValueOrException(
          r_possible,
          mosaic,
        ).value_boolean,
      });
    });
  }

  private getFromMosaicSingleValueOrException(
    reponse_def: KYCReponse,
    mosaic: {
      code: string;
      value_number?: number;
      value_boolean?: boolean;
    }[],
  ): {
    value_number?: number;
    value_boolean?: boolean;
  } {
    const found = mosaic.find((m) => m.code === reponse_def.code);
    if (found) {
      return {
        value_number: found.value_number,
        value_boolean: found.value_boolean,
      };
    }
    ApplicationError.throwMissinMosaicCode(reponse_def.code);
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

  private getCodeByLabel(label: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.label === label);
    return found ? found.code : null;
  }

  private getNGCCodeByLabel(label: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.label === label);
    return found ? found.ngc_code : null;
  }
  private getNGCCodeByCode(code: string): string {
    if (!this.reponses_possibles) {
      return null;
    }
    const found = this.reponses_possibles.find((r) => r.code === code);
    return found ? found.ngc_code : null;
  }
}
