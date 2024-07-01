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
}

export enum BooleanKYC {
  oui = 'oui',
  non = 'non',
  peut_etre = 'peut_etre',
}

export class KYCReponse {
  code: string;
  label: string;
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
      ngc_key: null,
      thematique: def.thematique,
      universes: def.universes,
      question: def.question,
      reponses_possibles: def.reponses ? def.reponses : [],
    });
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
