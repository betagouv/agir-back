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

export class ReponseSimple_v1 {
  unite?: Unite;
  value: string;

  static map(elem: KYCReponseSimple): ReponseSimple_v1 {
    return {
      unite: elem.unite,
      value: elem.value,
    };
  }
}
export class ReponseComplexe_v1 {
  label: string;
  code: string;
  value: string;
  ngc_code?: string;

  static map(elem: KYCReponseComplexe): ReponseComplexe_v1 {
    return {
      code: elem.code,
      label: elem.label,
      ngc_code: elem.ngc_code,
      value: elem.value,
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
  thematiques: Thematique[];
  conditions: ConditionKYC[][];

  a_supprimer?: boolean;
  short_question?: string;
  ngc_key?: string;
  image_url?: string;
  unite?: Unite;
  emoji?: string;

  reponse_simple: ReponseSimple_v1;
  reponse_complexe: ReponseComplexe_v1[];

  static map(elem: QuestionKYC): QuestionKYC_v1 {
    return QuestionKYC.serialise(elem);
  }
}

export class KYCHistory_v1 extends Versioned_v1 {
  answered_questions: QuestionKYC_v1[];
  answered_mosaics: KYCMosaicID[];

  static serialise(domain: KYCHistory): KYCHistory_v1 {
    return {
      version: 1,
      answered_questions: domain.answered_questions.map((e) =>
        QuestionKYC_v1.map(e),
      ),
      answered_mosaics: domain.answered_mosaics,
    };
  }

  static upgrade(source: KYCHistory_v0): KYCHistory_v1 {
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
          thematiques: question.universes
            ? question.universes.map((u) => Thematique[u])
            : null,
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
              value: question.reponses[0].label,
            };
          } else if (question.type === TypeReponseQuestionKYC.choix_unique) {
            new_question.reponse_complexe = [];
            let selected_code;
            if (question.reponses && question.reponses.length === 1) {
              selected_code = question.reponses[0].code;
            }
            for (const reponse_possible of question.reponses_possibles) {
              new_question.reponse_complexe.push({
                code: reponse_possible.code,
                label: reponse_possible.label,
                ngc_code: reponse_possible.ngc_code,
                value: reponse_possible.code === selected_code ? 'oui' : 'non',
              });
            }
          } else if (question.type === TypeReponseQuestionKYC.choix_multiple) {
            new_question.reponse_complexe = [];
            let selected_code = [];
            if (question.reponses) {
              for (const rep of question.reponses) {
                selected_code.push(rep.code);
              }
            }
            for (const reponse_possible of question.reponses_possibles) {
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