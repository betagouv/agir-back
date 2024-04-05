import { Versioned } from '../versioned';
import { KYCHistory } from '../../kyc/kycHistory';
import {
  CategorieQuestionKYC,
  KYCReponse,
  KYCID,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../../kyc/questionQYC';
import { Thematique } from '../../contenu/thematique';
import { Tag } from '../../scoring/tag';

export class KYCReponse_v0 {
  code: string;
  label: string;
  static map(elem: KYCReponse): KYCReponse_v0 {
    return {
      code: elem.code,
      label: elem.label,
    };
  }
}

export class QuestionKYC_v0 {
  id: KYCID;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: CategorieQuestionKYC;
  points: number;
  is_NGC: boolean;
  reponses?: KYCReponse_v0[];
  reponses_possibles?: KYCReponse_v0[];
  ngc_key?: string;
  thematique?: Thematique;
  tags: Tag[];

  static map(elem: QuestionKYC): QuestionKYC_v0 {
    return {
      id: elem.id,
      question: elem.question,
      type: elem.type,
      categorie: elem.categorie,
      points: elem.points,
      is_NGC: elem.is_NGC,
      reponses: elem.reponses
        ? elem.reponses.map((e) => KYCReponse_v0.map(e))
        : undefined,
      reponses_possibles: elem.reponses_possibles
        ? elem.reponses_possibles.map((e) => KYCReponse_v0.map(e))
        : undefined,
      ngc_key: elem.ngc_key,
      thematique: elem.thematique,
      tags: elem.tags,
    };
  }
}

export class KYCHistory_v0 extends Versioned {
  answered_questions: QuestionKYC_v0[];

  static serialise(domain: KYCHistory): KYCHistory_v0 {
    return {
      version: 0,
      answered_questions: domain.answered_questions.map((e) =>
        QuestionKYC_v0.map(e),
      ),
    };
  }
}
