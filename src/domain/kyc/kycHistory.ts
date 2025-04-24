import { Categorie } from '../contenu/categorie';
import { KYCHistory_v2 } from '../object_store/kyc/kycHistory_v2';
import { Thematique } from '../thematique/thematique';
import { KycDefinition } from './kycDefinition';
import { KYCMosaicID } from './KYCMosaicID';
import { MosaicKYC_CATALOGUE, MosaicKYCDef } from './mosaicKYC';
import { QuestionChoix } from './new_interfaces/QuestionChoix';
import { QuestionChoixMultiple } from './new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from './new_interfaces/QuestionChoixUnique';
import { QuestionNumerique } from './new_interfaces/QuestionNumerique';
import { QuestionSimple } from './new_interfaces/QuestionSimple';
import { QuestionTexteLibre } from './new_interfaces/QuestionTexteLibre';
import { AndConditionSet, QuestionKYC } from './questionKYC';

export class KYCHistory {
  private answered_questions: QuestionKYC[];
  private answered_mosaics: KYCMosaicID[];

  catalogue: KycDefinition[];

  constructor(data?: KYCHistory_v2) {
    this.reset();

    if (data && data.answered_questions) {
      for (const question of data.answered_questions) {
        this.answered_questions.push(new QuestionKYC(question));
      }
    }
    if (data && data.answered_mosaics) {
      this.answered_mosaics = data.answered_mosaics;
    }
  }

  public isKycAnswered(code: string): boolean {
    const found = this.answered_questions.find((q) => q.code === code);
    return !!found;
  }

  public getQuestionTextLibre(code: string): QuestionTexteLibre {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionTexteLibre(kyc);
    return undefined;
  }

  public getQuestionNumerique(code: string): QuestionNumerique {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionNumerique(kyc);
    return undefined;
  }

  public getQuestionChoixUnique(code: string): QuestionChoixUnique {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionChoixUnique(kyc);
    return undefined;
  }

  public getQuestionChoixMultiple(code: string): QuestionChoixMultiple {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionChoixMultiple(kyc);
    return undefined;
  }

  public getQuestionChoix(code: string): QuestionChoix {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionChoix(kyc);
    return undefined;
  }

  public getQuestionSimple(code: string): QuestionSimple {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return new QuestionSimple(kyc);
    return undefined;
  }

  public getQuestion(code: string): QuestionKYC {
    const kyc =
      this.getUpToDateAnsweredQuestionByCode(code) ||
      this.getKycFromCatalogue_new(code);
    if (kyc) return kyc;
    return undefined;
  }

  public getQuestionByNGCKey(ngc_key: string): QuestionKYC {
    const kyc =
      this.getUpToDateAnsweredQuestionByNGCKeyCode(ngc_key) ||
      this.getKycFromCatalogueByNGCKey_new(ngc_key);
    if (kyc) return kyc;
    return undefined;
  }

  public updateQuestion(
    question:
      | QuestionKYC
      | QuestionChoixMultiple
      | QuestionChoixUnique
      | QuestionSimple
      | QuestionNumerique
      | QuestionTexteLibre,
  ) {
    const kyc = question.getKyc();
    const index = this.answered_questions.findIndex((q) => q.code === kyc.code);
    if (index >= 0) {
      this.answered_questions[index] = kyc;
    } else {
      this.answered_questions.push(kyc);
    }
  }

  private getUpToDateAnsweredQuestionByNGCKeyCode(
    ngc_key: string,
  ): QuestionKYC {
    const answered = this.answered_questions.find(
      (element) => element.ngc_key === ngc_key,
    );
    if (answered) {
      this.refreshQuestion(answered);
      answered.is_answered = answered.hasAnyResponses();
    }
    return answered;
  }

  private getUpToDateAnsweredQuestionByCode(code: string): QuestionKYC {
    const answered = this.answered_questions.find(
      (element) => element.code === code,
    );
    if (answered) {
      this.refreshQuestion(answered);
      answered.is_answered = answered.hasAnyResponses();
    }
    return answered;
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

  public flagMosaicsAsAnsweredWhenAtLeastOneQuestionAnswered() {
    const mosaic_ids = MosaicKYC_CATALOGUE.listMosaicIDs();
    for (const mosaicId of mosaic_ids) {
      if (this.areMosaicKYCsAnyTouched(mosaicId)) {
        this.addAnsweredMosaic(mosaicId);
      }
    }
  }

  public areMosaicKYCsAnyTouched(mosaicId: KYCMosaicID): boolean {
    const mosaic_def = MosaicKYC_CATALOGUE.findMosaicDefByID(mosaicId);

    if (!mosaic_def) {
      return false;
    }

    for (const kyc_code of mosaic_def.question_kyc_codes) {
      const kyc = this.getQuestion(kyc_code);

      if (kyc && kyc.hasAnyResponses()) {
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
      if (MosaicKYC_CATALOGUE.isMosaicID(kyc_id)) {
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
      if (MosaicKYC_CATALOGUE.isMosaicID(kyc_code)) {
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
    this.catalogue = [];
  }

  public addAnsweredMosaic(type: KYCMosaicID) {
    if (!this.answered_mosaics.includes(type)) {
      this.answered_mosaics.push(type);
    }
  }
  public isMosaicAnswered(type: KYCMosaicID): boolean {
    return this.answered_mosaics.includes(type);
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

    const liste_mosaic_ids = MosaicKYC_CATALOGUE.listMosaicIDs();
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
    const mosaic_def = MosaicKYC_CATALOGUE.findMosaicDefByID(mosaicID);
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
    result.is_mosaic_answered = this.isMosaicAnswered(mosaic_def.id);

    return result;
  }

  public areConditionsMatched(conditions: AndConditionSet[]): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    let result = false;
    for (const and_set of conditions) {
      let union = true;
      for (const cond of and_set) {
        const kyc = this.getAnsweredQuestionByIdCMS(cond.id_kyc);
        if (!(kyc && new QuestionChoix(kyc).isSelected(cond.code_reponse))) {
          union = false;
        }
      }
      result = result || union;
    }
    return result;
  }

  public doesQuestionExistsByCode(code_question: string) {
    return !!code_question && this.getKYCDefinitionByCodeOrNull(code_question);
  }

  public getAnsweredQuestionByIdCMS(id_cms: number): QuestionKYC {
    return this.answered_questions.find((element) => element.id_cms === id_cms);
  }

  private getKYCDefinitionByCodeOrNull(code: string): KycDefinition {
    return this.catalogue.find((element) => element.code === code);
  }
}
