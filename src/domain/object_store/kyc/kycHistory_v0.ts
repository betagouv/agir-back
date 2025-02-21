import { Versioned, Versioned_v0 } from '../versioned';
import { KYCHistory } from '../../kyc/kycHistory';
import {
  KYCReponse,
  QuestionKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../kyc/questionKYC';
import { Thematique } from '../../thematique/thematique';
import { Tag } from '../../scoring/tag';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { KYCMosaicID } from '../../kyc/KYCMosaicID';
import { ConditionKYC } from '../../kyc/conditionKYC';

export class KYCReponse_v0 {
  code: string;
  label: string;
  ngc_code: string;
  value: string;

  static map(elem: KYCReponse): KYCReponse_v0 {
    return {
      code: elem.code,
      label: elem.label,
      ngc_code: elem.ngc_code,
      value: elem.value,
    };
  }
}

export class QuestionKYC_v0 {
  id: string;
  id_cms: number;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  points: number;
  is_NGC: boolean;
  a_supprimer: boolean;
  tags: Tag[];
  universes: string[];
  conditions: ConditionKYC[][];
  short_question: string;
  thematique: Thematique;
  ngc_key: string;
  image_url: string;
  unite: Unite;
  emoji: string;

  reponses?: KYCReponse_v0[];
  reponses_possibles?: KYCReponse_v0[];

  static map(elem: QuestionKYC): QuestionKYC_v0 {
    const result = {
      id: elem.code,
      question: elem.question,
      type: elem.type,
      categorie: elem.categorie,
      points: elem.points,
      is_NGC: elem.is_NGC,
      a_supprimer: elem.a_supprimer,
      reponses: undefined,
      reponses_possibles: undefined,
      ngc_key: elem.ngc_key,
      thematique: elem.thematique,
      tags: elem.tags,
      universes: elem.thematiques ? elem.thematiques : [],
      id_cms: elem.id_cms,
      short_question: elem.short_question,
      image_url: elem.image_url,
      conditions: elem.getConditions() ? elem.getConditions() : [],
      unite: elem.unite,
      emoji: elem.emoji,
    };

    return result;
  }
}

export class KYCHistory_v0 extends Versioned_v0 {
  answered_questions: QuestionKYC_v0[];
  answered_mosaics: KYCMosaicID[];

  static serialise(domain: KYCHistory): KYCHistory_v0 {
    return {
      version: 0,
      answered_questions: domain
        .getRawAnsweredKYCs()
        .map((e) => QuestionKYC_v0.map(e)),
      answered_mosaics: domain.getRawAnsweredMosaics(),
    };
  }
}
