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

export class QuestionKYCData {
  id: string;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  points: number;
  is_NGC: boolean;
  reponse?: string[];
  reponses_possibles?: string[];
  ngc_key?: string;
}

export class QuestionKYC extends QuestionKYCData {
  constructor(data: QuestionKYCData) {
    super();
    Object.assign(this, data);
  }
}
