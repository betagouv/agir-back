import { QuestionKYC_v2 } from '../object_store/kyc/kycHistory_v2';
import { Tag } from '../scoring/tag';
import {
  AndConditionSet,
  KYCReponseComplexe,
  KYCReponseSimple,
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

  public getKyc(): QuestionKYC {
    return this;
  }

  public isSimpleQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.decimal ||
      this.type === TypeReponseQuestionKYC.libre ||
      this.type === TypeReponseQuestionKYC.entier
    );
  }
  public isChoixQuestion(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.choix_unique ||
      this.type === TypeReponseQuestionKYC.choix_multiple
    );
  }
  public isChoixUnique(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_unique;
  }
  public isChampLibre(): boolean {
    return this.type === TypeReponseQuestionKYC.libre;
  }
  public isChampEntier(): boolean {
    return this.type === TypeReponseQuestionKYC.entier;
  }
  public isChampDecimal(): boolean {
    return this.type === TypeReponseQuestionKYC.decimal;
  }
  public isChoixMultiple(): boolean {
    return this.type === TypeReponseQuestionKYC.choix_multiple;
  }

  public hasConditions() {
    return this.conditions && this.conditions.length > 0;
  }

  public hasAnyResponses(): boolean {
    return this.hasAnySimpleResponse() || this.hasAnyComplexeResponse();
  }

  public getTags(): Tag[] {
    return this.tags.concat(this.thematique);
  }

  public getDistinctText(): string {
    return this.question;
  }
  public isLocal(): boolean {
    return false;
  }

  public static isTrueBooleanString(str: string): boolean {
    if (!str) return false;
    return ['oui', 'true', 'yes', '1'].includes(str.trim().toLowerCase());
  }

  public isMosaic(): boolean {
    return (
      this.type === TypeReponseQuestionKYC.mosaic_boolean ||
      this.type === TypeReponseQuestionKYC.mosaic_number
    );
  }

  public getConditions(): AndConditionSet[] {
    if (this.hasConditions()) return this.conditions;
    return [];
  }

  public isSelected(code_reponse: string): boolean {
    if (!this.hasAnyComplexeResponse()) {
      return false;
    }
    const found = this.reponse_complexe.find((r) => r.code === code_reponse);
    return found ? found.selected : false;
  }

  public getNGCCodeReponseQuestionChoixUnique(): string {
    if (!this.hasAnyComplexeResponse()) return null;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.ngc_code;
      }
    }
    return null;
  }

  public getNombreReponsesPossibles(): number {
    if (!this.reponse_complexe) return 0;
    return this.reponse_complexe.length;
  }

  public getReponseComplexeByCode<ID extends keyof KYCComplexValues>(
    code: string,
  ): KYCReponseComplexe<ID> {
    if (!this.reponse_complexe || !(this.reponse_complexe.length > 0))
      return null;
    return this.reponse_complexe.find(
      (r) => r.code === code,
    ) as KYCReponseComplexe<ID>;
  }

  public getRAWListeReponsesComplexes(): KYCReponseComplexe[] {
    return this.reponse_complexe ? this.reponse_complexe : [];
  }

  public getRAWReponseSimple(): KYCReponseSimple {
    return this.reponse_simple;
  }

  public getReponseSimpleValueAsNumber(): number {
    if (this.reponse_simple && this.reponse_simple.value) {
      return Number(this.reponse_simple.value);
    }
    return null;
  }

  public setReponseSimpleValue(value: string) {
    this.touch();
    this.reponse_simple.value = value;
  }

  public getReponseSimpleUnite(): Unite {
    if (this.reponse_simple) {
      return this.reponse_simple.unite;
    }
    return undefined;
  }

  public getSelectedLabels(): string[] {
    if (!this.reponse_complexe) return [];
    const result = [];
    for (const rep of this.reponse_complexe) {
      if (rep.selected) {
        result.push(rep.label);
      }
    }
    return result;
  }

  public getSelectedCodes(): string[] {
    if (!this.reponse_complexe) return [];
    const result = [];
    for (const rep of this.reponse_complexe) {
      if (rep.selected) {
        result.push(rep.code);
      }
    }
    return result;
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

  public selectChoixUniqueByCode(code: string) {
    if (!this.reponse_complexe) return;
    this.touch();
    for (const rep of this.reponse_complexe) {
      rep.selected = rep.code === code;
    }
  }

  private getQuestionComplexeByLabel(label: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.label === label);
  }

  private getQuestionComplexeByNgcCode(ngc_code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.ngc_code === ngc_code);
  }

  public getAllCodes(): string[] {
    if (!this.reponse_complexe) {
      return [];
    }
    return this.reponse_complexe.map((r) => r.code);
  }

  public getCodeByLabel(label: string): string {
    if (!this.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByLabel(label);
    return q ? q.code : null;
  }
  public getCodeByNGCCode(ngc_code: string): string {
    if (!this.reponse_complexe) {
      return null;
    }
    const q = this.getQuestionComplexeByNgcCode(ngc_code);
    return q ? q.code : null;
  }

  public static getProgression(liste: QuestionKYC[]): {
    current: number;
    target: number;
  } {
    let progression = 0;
    for (const question of liste) {
      if (question.isMosaic()) {
        if (question.is_mosaic_answered) {
          progression++;
        }
      } else if (question.hasAnyResponses()) {
        progression++;
      }
    }
    return { current: progression, target: liste.length };
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
