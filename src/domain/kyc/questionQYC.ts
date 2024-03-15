import { Thematique } from '../contenu/thematique';
import { QuestionKYC_v0 } from '../object_store/kyc/kycHistory_v0';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',
  entier = 'entier',
  decimal = 'decimal',
}

export enum CategorieQuestionKYC {
  service = 'service',
  defi = 'defi',
}

export class QuestionKYC implements TaggedContent {
  id: string;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  thematique?: Thematique;
  points: number;
  is_NGC: boolean;
  reponse?: string[];
  reponses_possibles?: string[];
  ngc_key?: string;
  tags: Tag[];
  score: number;

  constructor(data: QuestionKYC_v0) {
    this.id = data.id;
    this.question = data.question;
    this.type = data.type;
    this.categorie = data.categorie;
    this.points = data.points;
    this.is_NGC = data.is_NGC;
    this.reponse = data.reponse;
    this.reponses_possibles = data.reponses_possibles;
    this.ngc_key = data.ngc_key;
    this.thematique = data.thematique;
    this.tags = data.tags ? data.tags : [];
    this.score = 0;
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }
}
