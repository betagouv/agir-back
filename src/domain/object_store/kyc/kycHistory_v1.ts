import { Versioned_v1 } from '../versioned';
import { KYCHistory } from '../../kyc/kycHistory';
import {
  KYCReponseComplexe,
  KYCReponseSimple,
  QuestionKYC,
  TypeReponseQuestionKYC,
  Unite,
} from '../../kyc/questionKYC';
import { Thematique } from '../../contenu/thematique';
import { Tag } from '../../scoring/tag';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { ConditionKYC } from '../../kyc/conditionKYC';
import { KYCHistory_v0 } from './kycHistory_v0';
import { KYCMosaicID } from '../../kyc/KYCMosaicID';
import { ApplicationError } from '../../../infrastructure/applicationError';

export class ReponseSimple_v1 {
  unite: Unite | null;
  value: string | null;

  static map(elem: KYCReponseSimple): ReponseSimple_v1 {
    return {
      unite: elem.unite ?? null,
      value: elem.value ?? null,
    };
  }
}
export class ReponseComplexe_v1 {
  label: string;
  code: string;
  value: string | null;
  ngc_code: string | null;

  static map(elem: KYCReponseComplexe): ReponseComplexe_v1 {
    return {
      code: elem.code,
      label: elem.label,
      ngc_code: elem.ngc_code ?? null,
      value: elem.value ?? null,
    };
  }
}

export class QuestionKYC_v1 {
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

  a_supprimer: boolean | null;
  short_question: string | null;
  ngc_key: string | null;
  image_url: string | null;
  unite: Unite | null;
  emoji: string | null;

  reponse_simple: ReponseSimple_v1 | null;
  reponse_complexe: ReponseComplexe_v1[] | null;

  static map(elem: QuestionKYC): QuestionKYC_v1 {
    return {
      code: elem.code,
      question: elem.question,
      type: elem.type,
      categorie: elem.categorie,
      points: elem.points,
      is_NGC: elem.is_NGC,
      a_supprimer: elem.a_supprimer,
      ngc_key: elem.ngc_key ?? null,
      reponse_simple: elem.getRAWReponseSimple()
        ? ReponseSimple_v1.map(elem.getRAWReponseSimple())
        : null,
      reponse_complexe: elem
        .getRAWListeReponsesComplexes()
        .map((r) => ReponseComplexe_v1.map(r)),
      thematique: elem.thematique,
      tags: elem.tags,
      id_cms: elem.id_cms,
      short_question: elem.short_question ?? null,
      image_url: elem.image_url ?? null,
      conditions: elem.getConditions(),
      unite: elem.unite ?? null,
      emoji: elem.emoji ?? null,
    };
  }
}

export class KYCHistory_v1 extends Versioned_v1 {
  answered_questions: QuestionKYC_v1[];
  answered_mosaics: KYCMosaicID[];
  constructor() {
    super();
    this.answered_mosaics = [];
    this.answered_questions = [];
  }

  static serialise(domain: KYCHistory): KYCHistory_v1 {
    return {
      version: 1,
      answered_questions: domain
        .getRawAnsweredKYCs()
        .map((e) => QuestionKYC_v1.map(e)),
      answered_mosaics: domain.getRawAnsweredMosaics(),
    };
  }

  static upgrade(source: KYCHistory_v0): KYCHistory_v1 {
    if (source.version && source.version !== 0) {
      ApplicationError.throwBadVersionDetectedForUpgrade(source.version, 0);
    }
    const result: KYCHistory_v1 = {
      version: 1,
      answered_questions: [],
      answered_mosaics: source.answered_mosaics,
    };

    if (source.answered_questions) {
      for (const question of source.answered_questions) {
        let new_question: QuestionKYC_v1 = {
          code: question.id,
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
          reponse_simple: null,
          reponse_complexe: null,
        };

        if (question.reponses) {
          if (
            question.type === TypeReponseQuestionKYC.decimal ||
            question.type === TypeReponseQuestionKYC.entier ||
            question.type === TypeReponseQuestionKYC.libre
          ) {
            new_question.reponse_simple = {
              unite: question.unite,
              value: question.reponses[0]
                ? question.reponses[0].label
                : undefined,
            };
          } else if (question.type === TypeReponseQuestionKYC.choix_unique) {
            new_question.reponse_complexe = [];
            let selected_code: string | undefined = undefined;

            if (question.reponses && question.reponses.length === 1) {
              selected_code = question.reponses[0].code;
            }

            for (const reponse_possible of question.reponses_possibles ?? []) {
              new_question.reponse_complexe.push({
                code: reponse_possible.code,
                label: reponse_possible.label,
                ngc_code: reponse_possible.ngc_code,
                value: reponse_possible.code === selected_code ? 'oui' : 'non',
              });
            }
          } else if (question.type === TypeReponseQuestionKYC.choix_multiple) {
            new_question.reponse_complexe = [];

            const selected_code: string[] = [];
            if (question.reponses) {
              for (const rep of question.reponses) {
                selected_code.push(rep.code);
              }
            }

            for (const reponse_possible of question.reponses_possibles ?? []) {
              new_question.reponse_complexe.push({
                code: reponse_possible.code,
                label: reponse_possible.label,
                ngc_code: reponse_possible.ngc_code,
                value: selected_code.includes(reponse_possible.code)
                  ? 'oui'
                  : 'non',
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
