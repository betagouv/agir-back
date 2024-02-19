import { QuestionKYC_v0 } from '../object_store/kyc/kyc_v0';

export enum TypeReponseQuestionKYC {
  libre = 'libre',
  choix_unique = 'choix_unique',
  choix_multiple = 'choix_multiple',
  entier = 'entier',
  decimal = 'decimal',
}

export enum CategorieQuestionKYC {
  service = 'service',
}

export class QuestionKYC {
  id: string;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  points: number;
  is_NGC: boolean;
  reponse?: string[];
  reponses_possibles?: string[];
  ngc_key?: string;

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
  }
}
