import { ApplicationError } from '../../infrastructure/applicationError';
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
import { MosaicKYCDef, TypeMosaic } from './mosaicKYC';
import { KYCComplexValues } from './publicodesMapping';

export class QuestionKYC extends QuestionKYCData {
  constructor(data?: QuestionKYC_v2) {
    super(data);
  }

  public getKyc(): QuestionKYC {
    return this;
  }

  public static buildFromDef(def: KycDefinition): QuestionKYC {
    const result = new QuestionKYC({
      categorie: def.categorie,
      code: def.code,
      id_cms: def.id_cms,
      is_NGC: def.is_ngc,
      points: def.points,
      tags: def.tags,
      type: def.type,
      ngc_key: def.ngc_key,
      thematique: def.thematique,
      question: def.question,
      conditions: def.conditions ? def.conditions : [],
      a_supprimer: !!def.a_supprimer,
      reponse_simple: null,
      reponse_complexe: null,
      emoji: def.emoji,
      image_url: def.image_url,
      short_question: def.short_question,
      unite: def.unite,
      last_update: undefined,
    });
    result.is_answered = false;

    if (
      def.type === TypeReponseQuestionKYC.choix_unique ||
      def.type === TypeReponseQuestionKYC.choix_multiple
    ) {
      result.reponse_complexe = [];
      for (const reponse of def.reponses) {
        result.reponse_complexe.push({
          label: reponse.label,
          code: reponse.code,
          ngc_code: reponse.ngc_code,
          selected: false,
        });
      }
    } else {
      result.reponse_simple = {
        unite: def.unite,
        value: undefined,
      };
    }

    return result;
  }

  public static buildFromMosaicDef(
    def: MosaicKYCDef,
    liste_kyc: QuestionKYC[],
  ): QuestionKYC {
    const result = new QuestionKYC({
      id_cms: undefined,
      question: def.titre,
      thematique: def.thematique,
      categorie: def.categorie,
      code: def.id,
      points: def.points,
      type:
        def.type === TypeMosaic.mosaic_boolean
          ? TypeReponseQuestionKYC.mosaic_boolean
          : TypeReponseQuestionKYC.mosaic_number,
      is_NGC: false,
      tags: [],
      conditions: [],
      a_supprimer: false,
      reponse_simple: undefined,
      reponse_complexe: undefined,
      last_update: undefined,
    });
    if (def.type === TypeMosaic.mosaic_boolean) {
      result.reponse_complexe =
        QuestionKYC.buildBooleanResponseListe(liste_kyc);
    }

    return result;
  }

  private static buildBooleanResponseListe(
    kyc_liste: QuestionKYC[],
  ): KYCReponseComplexe[] {
    const liste_reponses: KYCReponseComplexe[] = [];
    for (const kyc of kyc_liste) {
      let value: string;
      let selected: boolean;
      if (kyc.hasAnyResponses()) {
        if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
          value = kyc.getSelected() === 'oui' ? 'oui' : 'non';
          selected = kyc.getSelected() === 'oui';
        } else if (kyc.type === TypeReponseQuestionKYC.entier) {
          value = kyc.getReponseSimpleValue() === '1' ? 'oui' : 'non';
          selected = kyc.getReponseSimpleValue() === '1';
        }
      } else {
        value = 'non';
        selected = false;
      }
      liste_reponses.push({
        code: kyc.code,
        value: value,
        selected: selected,
        label: kyc.short_question,
        image_url: kyc.image_url,
        unite: kyc.unite,
        emoji: kyc.emoji,
        ngc_code: undefined,
      });
    }
    return liste_reponses;
  }

  public refreshFromDef(def: KycDefinition) {
    if (
      def.type === TypeReponseQuestionKYC.choix_unique ||
      def.type === TypeReponseQuestionKYC.choix_multiple
    ) {
      const updated_set: KYCReponseComplexe[] = [];
      for (const def_reponse of def.reponses) {
        const current_rep = this.getQuestionComplexeByCode(def_reponse.code);
        if (current_rep) {
          current_rep.ngc_code = def_reponse.ngc_code;
          current_rep.label = def_reponse.label;
          updated_set.push(current_rep);
        } else {
          updated_set.push({
            code: def_reponse.code,
            label: def_reponse.label,
            ngc_code: def_reponse.ngc_code,
            selected: false,
          });
        }
      }
      this.reponse_complexe = updated_set;
    } else {
      if (this.reponse_simple) {
        this.reponse_simple.unite = def.unite;
      }
    }

    this.question = def.question;
    this.type = def.type;
    this.categorie = def.categorie;
    this.points = def.points;
    this.is_NGC = def.is_ngc;
    this.a_supprimer = !!def.a_supprimer;
    this.ngc_key = def.ngc_key;
    this.thematique = def.thematique;
    this.tags = def.tags ? def.tags : [];
    this.conditions = def.conditions ? def.conditions : [];
    this.id_cms = def.id_cms;
    this.emoji = def.emoji;
    this.image_url = def.image_url;
    this.unite = def.unite;
    this.short_question = def.short_question;
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
  public hasAnySimpleResponse(): boolean {
    if (this.reponse_simple && this.reponse_simple.value) {
      return true;
    }
    return false;
  }
  public hasAnyComplexeResponse(): boolean {
    if (this.reponse_complexe) {
      for (const reponse of this.reponse_complexe) {
        if (!!reponse.value) return true;
        if (!!reponse.selected) return true;
      }
    }
    return false;
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

  public getSelected(): string | null {
    if (!this.hasAnyComplexeResponse()) return null;
    for (const reponse of this.reponse_complexe) {
      if (reponse.selected) {
        return reponse.code;
      }
    }
    return null;
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

  public getReponseSimpleValue(): string {
    if (this.reponse_simple) {
      return this.reponse_simple.value;
    }
    return undefined;
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

  private getQuestionComplexeByCode(code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.code === code);
  }

  private getQuestionComplexeByLabel(label: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.label === label);
  }

  private getQuestionComplexeByNgcCode(ngc_code: string): KYCReponseComplexe {
    if (!this.reponse_complexe) return null;
    return this.reponse_complexe.find((r) => r.ngc_code === ngc_code);
  }

  // DEPRECATED
  private throwExceptionIfReponseNotExists(reponses: string[]) {
    if (
      this.type !== TypeReponseQuestionKYC.choix_multiple &&
      this.type !== TypeReponseQuestionKYC.choix_unique
    ) {
      return;
    }
    for (const reponse_label of reponses) {
      const code = this.getCodeByLabel(reponse_label);
      if (!code) {
        ApplicationError.throwBadResponseValue(reponse_label, this.code);
      }
    }
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
