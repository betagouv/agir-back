import { ApplicationError } from '../../../infrastructure/applicationError';
import { Categorie } from '../../contenu/categorie';
import { Thematique } from '../../contenu/thematique';
import { KYCMosaicID } from '../../kyc/KYCMosaicID';
import { ConditionKYC } from '../../kyc/conditionKYC';
import { KYCHistory } from '../../kyc/kycHistory';
import {
  KYCReponseComplexe,
  KYCReponseSimple,
  QuestionKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../kyc/questionKYC';
import { Thematique } from '../../thematique/thematique';
import { Tag } from '../../scoring/tag';
import { Versioned_v2 } from '../versioned';
import { KYCHistory_v1 } from './kycHistory_v1';

export class ReponseSimple_v2 {
  unite?: Unite;
  value: string;

  static map(elem: KYCReponseSimple): ReponseSimple_v2 {
    return {
      unite: elem.unite,
      value: elem.value,
    };
  }
}
export class ReponseComplexe_v2 {
  label: string;
  code: string;
  value?: string;
  selected: boolean;
  ngc_code?: string;

  static map(elem: KYCReponseComplexe): ReponseComplexe_v2 {
    return {
      code: elem.code,
      label: elem.label,
      ngc_code: elem.ngc_code,
      value: elem.value,
      selected: elem.selected,
    };
  }
}

export class QuestionKYC_v2 {
  last_update: Date;
  code: string;
  id_cms: number;
  question: string;
  type: TypeReponseQuestionKYC;
  categorie: Categorie;
  points: number;
  is_NGC: boolean;
  tags: Tag[];
  thematique: Thematique;
  conditions: ConditionKYC[][];

  a_supprimer?: boolean;
  short_question?: string;
  ngc_key?: string;
  image_url?: string;
  unite?: Unite;
  emoji?: string;

  reponse_simple?: ReponseSimple_v2;
  reponse_complexe: ReponseComplexe_v2[];

  static map(elem: QuestionKYC): QuestionKYC_v2 {
    return {
      last_update: elem.last_update,
      code: elem.code,
      question: elem.question,
      type: elem.type,
      categorie: elem.categorie,
      points: elem.points,
      is_NGC: elem.is_NGC,
      a_supprimer: elem.a_supprimer,
      ngc_key: elem.ngc_key,
      reponse_simple: elem.getRAWReponseSimple()
        ? ReponseSimple_v2.map(elem.getRAWReponseSimple())
        : null,
      reponse_complexe: elem
        .getRAWListeReponsesComplexes()
        .map((r) => ReponseComplexe_v2.map(r)),
      thematique: elem.thematique,
      tags: elem.tags,
      id_cms: elem.id_cms,
      short_question: elem.short_question,
      image_url: elem.image_url,
      conditions: elem.getConditions(),
      unite: elem.unite,
      emoji: elem.emoji,
    };
  }
}

export class KYCHistory_v2 extends Versioned_v2 {
  answered_questions: QuestionKYC_v2[];
  answered_mosaics: KYCMosaicID[];
  constructor() {
    super();
    this.answered_mosaics = [];
    this.answered_questions = [];
  }

  static serialise(domain: KYCHistory): KYCHistory_v2 {
    return {
      version: 2,
      answered_questions: domain
        .getRawAnsweredKYCs()
        .map((e) => QuestionKYC_v2.map(e)),
      answered_mosaics: domain.getRawAnsweredMosaics(),
    };
  }

  static upgrade(source: KYCHistory_v1): KYCHistory_v2 {
    if (source.version && source.version !== 1) {
      ApplicationError.throwBadVersionDetectedForUpgrade(source.version, 1);
    }
    const result: KYCHistory_v2 = {
      version: 2,
      answered_questions: [],
      answered_mosaics: source.answered_mosaics,
    };
    if (source.answered_questions) {
      for (const question of source.answered_questions) {
        let new_question: QuestionKYC_v2 = {
          last_update: undefined,
          code: question.code,
          id_cms: question.id_cms,
          categorie: question.categorie,
          conditions: question.conditions,
          emoji: question.emoji,
          image_url: question.image_url,
          is_NGC: question.is_NGC,
          ngc_key: question.ngc_key,
          points: question.points,
          question: question.question,
          short_question: question.short_question,
          tags: question.tags,
          thematique: question.thematique,
          type: question.type,
          a_supprimer: question.a_supprimer,
          unite: question.unite,
          reponse_simple: question.reponse_simple,
          reponse_complexe: null,
        };

        if (question.reponse_complexe) {
          new_question.reponse_complexe = [];
          if (
            question.type === TypeReponseQuestionKYC.choix_unique ||
            question.type === TypeReponseQuestionKYC.choix_multiple
          ) {
            for (const reponse of question.reponse_complexe) {
              new_question.reponse_complexe.push({
                code: reponse.code,
                label: reponse.label,
                ngc_code: reponse.ngc_code,
                selected: QuestionKYC.isTrueBooleanString(reponse.value),
              });
            }
          }
        }
        result.answered_questions.push(new_question);
      }
    }
    return result;
  }
}
