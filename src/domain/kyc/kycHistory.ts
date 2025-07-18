import { Categorie } from '../contenu/categorie';
import { KYCHistory_v2 } from '../object_store/kyc/kycHistory_v2';
import { Thematique } from '../thematique/thematique';
import { KycDefinition } from './kycDefinition';
import { KYCID } from './KYCID';
import { KYCMosaicID, MosaicCatalogue } from './mosaicDefinition';
import { MosaicKYCDef } from './mosaicKYC';
import { QuestionChoix } from './new_interfaces/QuestionChoix';
import { QuestionChoixMultiple } from './new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from './new_interfaces/QuestionChoixUnique';
import { QuestionNumerique } from './new_interfaces/QuestionNumerique';
import { QuestionSimple } from './new_interfaces/QuestionSimple';
import { QuestionTexteLibre } from './new_interfaces/QuestionTexteLibre';
import { AndConditionSet, QuestionKYC } from './questionKYC';

export type AnyQuestion =
  | QuestionKYC
  | QuestionChoixMultiple<KYCID>
  | QuestionChoixUnique<KYCID>
  | QuestionSimple
  | QuestionNumerique
  | QuestionTexteLibre;

export class KYCHistory {
  private answered_questions: QuestionKYC[];
  private skipped_questions: QuestionKYC[];
  private answered_mosaics: KYCMosaicID[];
  private skipped_mosaics: KYCMosaicID[];

  catalogue: KycDefinition[];

  constructor(data?: KYCHistory_v2) {
    this.reset();

    if (data && data.answered_questions) {
      for (const question of data.answered_questions) {
        this.answered_questions.push(new QuestionKYC(question));
      }
    }
    if (data && data.skipped_questions) {
      for (const question of data.skipped_questions) {
        this.skipped_questions.push(new QuestionKYC(question));
      }
    }
    if (data && data.answered_mosaics) {
      this.answered_mosaics = data.answered_mosaics;
    }
    if (data && data.skipped_mosaics) {
      this.skipped_mosaics = data.skipped_mosaics;
    }
  }

  public isKycAnswered(code: string): boolean {
    const found = this.answered_questions.find((q) => q.code === code);
    return !!found;
  }

  public getQuestionTextLibre(code: string): QuestionTexteLibre {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionTexteLibre(kyc);
    return undefined;
  }

  public getQuestionNumerique(code: string): QuestionNumerique {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionNumerique(kyc);
    return undefined;
  }

  public getQuestionChoixUnique<ID extends KYCID>(
    code: ID,
  ): QuestionChoixUnique<ID> | undefined {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionChoixUnique(kyc);
    return undefined;
  }

  public getQuestionChoixMultiple<ID extends KYCID>(
    code: ID,
  ): QuestionChoixMultiple<ID> | undefined {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionChoixMultiple(kyc);
    return undefined;
  }

  public getQuestionChoix<ID extends KYCID>(
    code: ID,
  ): QuestionChoix<ID> | undefined {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionChoix(kyc);
    return undefined;
  }

  public getQuestionSimple(code: string): QuestionSimple {
    const kyc = this.getQuestion(code);
    if (kyc) return new QuestionSimple(kyc);
    return undefined;
  }

  public getQuestion(code: string): QuestionKYC {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getUpToDateSkippedQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);

    if (kyc && kyc.isBrokenAnsweredKyc()) {
      kyc.is_answered = false;
    }
    return kyc;
  }

  public getQuestionByNGCKey(ngc_key: string): QuestionKYC {
    const kyc =
      this.getUpToDateAnsweredQuestionByNGCKeyCode(ngc_key) ||
      this.getKycFromCatalogueByNGCKey_new(ngc_key);
    if (kyc) return kyc;
    return undefined;
  }

  public updateQuestion(question: AnyQuestion) {
    const kyc = question.getKyc();
    this.setQuestionToList(kyc, this.answered_questions);
    this.removeQuestionFromList(kyc, this.skipped_questions);
  }

  public skipQuestion(question: AnyQuestion) {
    const kyc = question.getKyc();
    if (kyc.is_answered) {
      return; // skipped une question déjà répondu n'a pas d'effet
    }
    this.setQuestionToList(kyc, this.skipped_questions);

    // au cas où les question était cassée
    this.removeQuestionFromList(kyc, this.answered_questions);
  }

  public skipMosaic(id: KYCMosaicID) {
    if (this.isMosaicAnswered(id)) {
      return; // skipped une question déjà répondu n'a pas d'effet
    }
    this.addSkippedMosaic(id);
  }

  private getUpToDateAnsweredQuestionByNGCKeyCode(
    ngc_key: string,
  ): QuestionKYC {
    const answered = this.answered_questions.find(
      (element) => element.ngc_key === ngc_key,
    );
    if (answered) {
      this.refreshQuestion(answered);
      answered.is_answered = true;
      answered.is_skipped = false;
    }
    return answered;
  }

  private getUpToDateAnsweredQuestionByCode(code: string): QuestionKYC {
    const answered = this.answered_questions.find(
      (element) => element.code === code,
    );
    if (answered) {
      this.refreshQuestion(answered);
      answered.is_answered = true;
      answered.is_skipped = false;
    }
    return answered;
  }

  private getUpToDateSkippedQuestionByCode(code: string): QuestionKYC {
    const skipped = this.skipped_questions.find(
      (element) => element.code === code,
    );
    if (skipped) {
      this.refreshQuestion(skipped);
      skipped.is_skipped = true;
      skipped.is_answered = false;
    }
    return skipped;
  }

  private getKycFromCatalogue_new(code: string): QuestionKYC {
    const found = this.catalogue.find((element) => element.code === code);
    if (found) {
      return QuestionKYC.buildFromDef(found);
    }
    return undefined;
  }
  private getKycFromCatalogueByNGCKey_new(ngc_key: string): QuestionKYC {
    const found = this.catalogue.find((element) => element.ngc_key === ngc_key);
    if (found) {
      return QuestionKYC.buildFromDef(found);
    }
    return undefined;
  }

  public getLastUpdate(): Date {
    let max_epoch = 0;
    for (const kyc of this.answered_questions) {
      if (kyc.last_update) {
        max_epoch = Math.max(max_epoch, kyc.last_update.getTime());
      }
    }
    return new Date(max_epoch);
  }

  public getAnsweredKYCs(): QuestionKYC[] {
    return this.answered_questions;
  }
  public getSkippedKYCs(): QuestionKYC[] {
    return this.skipped_questions;
  }
  public getAnsweredKYCsAfter(after: Date): QuestionKYC[] {
    return this.answered_questions.filter(
      (q) =>
        q.last_update === null ||
        q.last_update === undefined ||
        q.last_update.getTime() > after.getTime(),
    );
  }
  public getAnsweredMosaics(): KYCMosaicID[] {
    return this.answered_mosaics;
  }
  public getSkippedMosaics(): KYCMosaicID[] {
    return this.skipped_mosaics;
  }

  public flagMosaicsAsAnsweredWhenAtLeastOneQuestionAnswered() {
    const mosaic_ids = MosaicCatalogue.listMosaicIDs();
    for (const mosaicId of mosaic_ids) {
      if (this.areMosaicKYCsAnyTouched(mosaicId)) {
        this.addAnsweredMosaic(mosaicId);
      }
    }
  }

  public areMosaicKYCsAnyTouched(mosaicId: KYCMosaicID): boolean {
    const mosaic_def = MosaicCatalogue.findMosaicDefByID(mosaicId);

    if (!mosaic_def) {
      return false;
    }

    for (const kyc_code of mosaic_def.question_kyc_codes) {
      const kyc = this.getQuestion(kyc_code);

      if (kyc && kyc.is_answered) {
        return true;
      }
    }

    return false;
  }

  public getEnchainementKYCsEligibles(
    liste_kycs_codes: string[],
  ): QuestionKYC[] {
    const result: QuestionKYC[] = [];
    for (const kyc_id of liste_kycs_codes) {
      if (MosaicCatalogue.isMosaicID(kyc_id)) {
        const mosaic = this.getUpToDateMosaicById(KYCMosaicID[kyc_id]);
        if (mosaic) {
          result.push(mosaic);
        }
      } else {
        const kyc = this.getQuestion(kyc_id);
        if (kyc && this.isKYCEligible(kyc)) {
          result.push(kyc);
        }
      }
    }
    return result;
  }

  public getListeKycsFromCodes(liste_kycs_codes: string[]): QuestionKYC[] {
    const result: QuestionKYC[] = [];
    for (const kyc_code of liste_kycs_codes) {
      if (MosaicCatalogue.isMosaicID(kyc_code)) {
        const mosaic = this.getUpToDateMosaicById(KYCMosaicID[kyc_code]);
        if (mosaic) {
          result.push(mosaic);
        }
      } else {
        const kyc = this.getQuestion(kyc_code);
        if (kyc) {
          result.push(kyc);
        }
      }
    }
    return result;
  }

  public isKYCEligible(kyc: QuestionKYC) {
    if (!kyc) {
      return false;
    }
    return this.areConditionsMatched(kyc.getConditions());
  }

  public setCatalogue(cat: KycDefinition[]) {
    this.catalogue = cat;
  }

  public reset() {
    this.answered_questions = [];
    this.answered_mosaics = [];
    this.skipped_mosaics = [];
    this.skipped_questions = [];
    this.catalogue = [];
  }

  public addAnsweredMosaic(type: KYCMosaicID) {
    if (!this.answered_mosaics.includes(type)) {
      this.answered_mosaics.push(type);
    }
    this.removeSkippedMosaic(type);
  }
  public addSkippedMosaic(type: KYCMosaicID) {
    if (!this.skipped_mosaics.includes(type)) {
      this.skipped_mosaics.push(type);
    }
  }
  public removeSkippedMosaic(type: KYCMosaicID) {
    const index = this.skipped_mosaics.findIndex((k) => k === type);
    if (index > -1) {
      this.skipped_mosaics.splice(index, 1);
    }
  }
  public isMosaicAnswered(type: KYCMosaicID): boolean {
    return this.answered_mosaics.includes(type);
  }
  public isMosaicSkipped(type: KYCMosaicID): boolean {
    return this.skipped_mosaics.includes(type);
  }

  public getAllKycs(): QuestionKYC[] {
    const result: QuestionKYC[] = [];

    this.catalogue.forEach((question) => {
      const answered_question = this.getQuestion(question.code);
      result.push(answered_question || QuestionKYC.buildFromDef(question));
    });
    return result;
  }

  public getAllKycsAndMosaics(): QuestionKYC[] {
    const result = this.getAllKycs();

    const liste_mosaic_ids = MosaicCatalogue.listMosaicIDs();
    for (const mosaic_id of liste_mosaic_ids) {
      result.push(this.getUpToDateMosaicById(mosaic_id));
    }

    return result;
  }

  public getKYCsNeverAnswered(
    categorie?: Categorie,
    thematique?: Thematique,
  ): QuestionKYC[] {
    let kycs_catalogue_by_cat = this.getKYCFromCatalogueByCategorie(categorie);

    let liste_nouvelles_kyc = [];
    for (const kyc_catalogue of kycs_catalogue_by_cat) {
      const answered = this.isKycAnswered(kyc_catalogue.code);
      if (!answered) {
        liste_nouvelles_kyc.push(kyc_catalogue);
      }
    }

    if (thematique) {
      liste_nouvelles_kyc = liste_nouvelles_kyc.filter(
        (k) => k.thematique === thematique,
      );
    }

    return liste_nouvelles_kyc;
  }

  private getKYCFromCatalogueByCategorie(categorie?: Categorie): QuestionKYC[] {
    if (!categorie) {
      return this.catalogue.map((c) => QuestionKYC.buildFromDef(c));
    }
    return this.catalogue
      .filter((c) => c.categorie === categorie)
      .map((c) => QuestionKYC.buildFromDef(c));
  }

  private refreshQuestion(kyc: QuestionKYC): QuestionKYC {
    if (!kyc) return null;

    const question_catalogue = this.getKYCDefinitionByCodeOrNull(kyc.code);
    if (question_catalogue) {
      kyc.refreshFromDef(question_catalogue);
    }
    return kyc;
  }

  public getUpToDateMosaicById(mosaicID: KYCMosaicID): QuestionKYC {
    if (!mosaicID) return null;
    const mosaic_def = MosaicCatalogue.findMosaicDefByID(mosaicID);
    return this.getUpToDateMosaic(mosaic_def);
  }

  public getUpToDateMosaic(mosaic_def: MosaicKYCDef): QuestionKYC {
    if (!mosaic_def) return null;

    const target_kyc_liste: QuestionKYC[] = [];
    for (const kyc_code of mosaic_def.question_kyc_codes) {
      const kyc = this.getQuestion(kyc_code);
      if (kyc) {
        target_kyc_liste.push(kyc);
      }
    }

    const result = QuestionKYC.buildFromMosaicDef(mosaic_def, target_kyc_liste);
    result.is_answered = this.isMosaicAnswered(mosaic_def.id);
    result.is_skipped = this.isMosaicSkipped(mosaic_def.id);

    return result;
  }

  public areConditionsMatched(conditions: AndConditionSet[]): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    let or_result = false;
    for (const and_set of conditions) {
      let and_result = true;
      for (const cond of and_set) {
        let is_ok = false;
        const kyc = this.getAnsweredQuestionByIdCMS(cond.id_kyc);
        if (kyc) {
          if (kyc.isChoixQuestion()) {
            is_ok = new QuestionChoix(kyc).isSelected(cond.code_reponse);
          }
          if (kyc.isNumerique()) {
            const value = new QuestionNumerique(kyc).getValue();
            const evalved_condition = eval(cond.code_reponse);
            is_ok = !!evalved_condition;
          }
        } else {
          is_ok = false;
        }
        and_result = and_result && is_ok;
        if (!and_result) {
          break;
        }
      }
      or_result = or_result || and_result;
      if (or_result) {
        break;
      }
    }

    return or_result;
  }

  public doesQuestionExistsByCode(code_question: KYCID): boolean {
    return (
      !!code_question &&
      this.getKYCDefinitionByCodeOrNull(code_question) != null
    );
  }

  private getAnsweredQuestionByIdCMS(id_cms: number): QuestionKYC {
    return this.answered_questions.find((element) => element.id_cms === id_cms);
  }

  private getKYCDefinitionByCodeOrNull(code: string): KycDefinition {
    return this.catalogue.find((element) => element.code === code);
  }

  private removeQuestionFromList(kyc: QuestionKYC, liste: QuestionKYC[]) {
    const index = liste.findIndex((k) => k.code === kyc.code);
    if (index > -1) {
      liste.splice(index, 1);
    }
  }

  private setQuestionToList(kyc: QuestionKYC, liste: QuestionKYC[]) {
    const index = liste.findIndex((k) => k.code === kyc.code);
    if (index >= 0) {
      liste[index] = kyc;
    } else {
      liste.push(kyc);
    }
  }
}
