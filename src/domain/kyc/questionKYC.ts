import { QuestionKYC_v2 } from '../object_store/kyc/kycHistory_v2';
import { Tag } from '../scoring/tag';
import { Progression } from './Progression';
import {
  AndConditionSet,
  KYCReponseComplexe,
  QuestionKYCData,
  TypeReponseQuestionKYC,
  Unite,
} from './QuestionKYCData';
import { KycDefinition } from './kycDefinition';
import { MosaicKYCDef } from './mosaicKYC';
import { KYCComplexValues } from './publicodesMapping';

export class QuestionKYC extends QuestionKYCData {
  constructor(data?: QuestionKYC_v2) {
    super(data);
  }

  public static buildFromDef(def: KycDefinition): QuestionKYC {
    const kyc = new QuestionKYC();
    Object.assign(kyc, QuestionKYC.buildKycFromDef(def));
    return kyc;
  }

  public static buildFromMosaicDef(
    def: MosaicKYCDef,
    liste_kyc: QuestionKYC[],
  ): QuestionKYC {
    const kyc = new QuestionKYC();
    Object.assign(kyc, QuestionKYC.buildKycFromMosaicDef(def, liste_kyc));
    return kyc;
  }

  public getKyc(): QuestionKYC {
    return this;
  }

  // OK
  public isSimpleQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.decimal ||
      this.type === TypeReponseQuestionKYC.libre ||
      this.type === TypeReponseQuestionKYC.entier
    );
  }
  // OK
  public isChoixQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.choix_unique ||
      this.type === TypeReponseQuestionKYC.choix_multiple
    );
  }

  // OK
  public isChoixUnique(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_unique;
  }
  // OK
  public isChampLibre(): boolean {
    return this.type === TypeReponseQuestionKYC.libre;
  }
  // OK
  public isChampEntier(): boolean {
    return this.type === TypeReponseQuestionKYC.entier;
  }
  // OK
  public isChampDecimal(): boolean {
    return this.type === TypeReponseQuestionKYC.decimal;
  }
  // OK
  public isChoixMultiple(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_multiple;
  }

  // OK
  public hasConditions() {
    return this.conditions && this.conditions.length > 0;
  }

  // OK
  public hasAnyResponses(): boolean {
    return this.hasAnySimpleResponse() || this.hasAnyComplexeResponse();
  }

  // OK
  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  // OK
  public getDistinctText(): string {
    return this.question;
  }

  // OK
  public isLocal(): boolean {
    return false;
  }

  // OK
  public isMosaic(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.mosaic_boolean ||
      this.type === TypeReponseQuestionKYC.mosaic_number
    );
  }

  // OK
  public getConditions(): AndConditionSet[] {
    if (this.hasConditions()) return this.conditions;
    return [];
  }

  public getUnite(): Unite {
    if (this.reponse_simple) {
      return this.reponse_simple.unite;
    }
    return undefined;
  }

  public static getProgression(liste: QuestionKYC[]): Progression {
    let progression = 0;
    for (const question of liste) {
      if (question.is_answered) {
        progression++;
      }
    }
    return new Progression(progression, liste.length);
  }

  /**
   * Returns the selected answer for a question of type {@link TypeReponseQuestionKYC.choix_unique}
   *
   * @returns The selected answer or undefined if no answer is selected or the question is not of type {@link TypeReponseQuestionKYC.choix_unique}.
   *
   * @note The methode could be parametrized to type check the return value according to {@link KYCComplexValues}.
   *
   * NOTE: The class should be parametrized instead of the method, however it
   * will require a lot of refactoring so this is a temporary solution.
   */
  public getSelectedAnswer<ID extends keyof KYCComplexValues>():
    | KYCReponseComplexe<ID>
    | undefined {
    if (
      this.type === TypeReponseQuestionKYC.choix_unique &&
      this.reponse_complexe
    ) {
      return this.reponse_complexe.find(
        (r) => r.selected,
      ) as KYCReponseComplexe<ID>;
    }
  }
}
/**
 * @example
 * extractUnite('kg (kilogramme)') === { abreviation: 'kg', long: 'kilogramme'}
 * extractUnite('€/kWh (euro par kilowattheure)') === { abreviation: '€/kWh', long: 'euro par kilowattheure'}
 * extractUnite('kg') === { abreviation: 'kg' }
 * extractUnite() === null
 */
export function parseUnite(label_unite: string | undefined): Unite | null {
  if (!label_unite) {
    return null;
  }

  const space_index = label_unite.indexOf(' ');

  return space_index === -1
    ? { abreviation: label_unite }
    : {
        abreviation: label_unite.substring(0, space_index),
        long: label_unite
          .substring(space_index + 1)
          .replace(/^\(/, '')
          .replace(/\)$/, ''),
      };
}
export { AndConditionSet, TypeReponseQuestionKYC };
