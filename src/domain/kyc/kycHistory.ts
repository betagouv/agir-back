import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../contenu/thematique';
import { Chauffage, DPE, Superficie, TypeLogement } from '../logement/logement';
import { KYCHistory_v1 } from '../object_store/kyc/kycHistory_v1';
import { Utilisateur } from '../utilisateur/utilisateur';
import { KycDefinition } from './kycDefinition';
import { KYCID } from './KYCID';
import { KYCMosaicID } from './KYCMosaicID';
import { MosaicKYC_CATALOGUE, MosaicKYCDef } from './mosaicKYC';
import {
  AndConditionSet,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from './questionKYC';
import validator from 'validator';

type LogementInput = {
  nombre_adultes?: number;
  nombre_enfants?: number;
  code_postal?: string;
  commune?: string;
  type?: TypeLogement;
  superficie?: Superficie;
  proprietaire?: boolean;
  chauffage?: Chauffage;
  plus_de_15_ans?: boolean;
  dpe?: DPE;
};

export class KYCHistory {
  answered_questions: QuestionKYC[];
  answered_mosaics: KYCMosaicID[];

  catalogue: KycDefinition[];

  constructor(data?: KYCHistory_v1) {
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
      const kyc = this.getUpToDateQuestionByCodeOrNull(kyc_code);

      if (kyc && kyc.hasAnyResponses()) {
        return true;
      }
    }

    return false;
  }

  public getEnchainementKYCsEligibles(liste_kycs_ids: string[]): QuestionKYC[] {
    const result: QuestionKYC[] = [];
    for (const kyc_id of liste_kycs_ids) {
      if (MosaicKYC_CATALOGUE.isMosaicID(kyc_id)) {
        const mosaic = this.getUpToDateMosaicById(KYCMosaicID[kyc_id]);
        if (mosaic) {
          result.push(mosaic);
        }
      } else {
        const kyc = this.getUpToDateQuestionByCodeOrNull(kyc_id);
        if (kyc && this.isKYCEligible(kyc)) {
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

  public getAllUpToDateQuestionSet(kyc_only: boolean = false): QuestionKYC[] {
    let result: QuestionKYC[] = [];

    this.catalogue.forEach((question) => {
      const answered_question = this.getAnsweredQuestionByCode(question.code);
      if (answered_question) {
        answered_question.refreshFromDef(question);
      }
      result.push(answered_question || QuestionKYC.buildFromDef(question));
    });
    if (kyc_only) {
      return result;
    }

    const liste_mosaic_ids = MosaicKYC_CATALOGUE.listMosaicIDs();
    for (const mosaic_id of liste_mosaic_ids) {
      result.push(this.getUpToDateMosaicById(mosaic_id));
    }

    return result;
  }

  public injectSituationNGC(
    situation: object,
    utilisateur: Utilisateur,
  ): string[] {
    const result = [];
    for (const [key, value] of Object.entries(situation)) {
      const kyc = this.getKYCByNGCKeyFromCatalogue(key);

      if (!kyc) {
        console.log(`KYC NGC manquant dans agir [${key}]`);
      } else {
        if (kyc.is_NGC) {
          const string_value = '' + value;

          const is_kyc_number =
            kyc.type === TypeReponseQuestionKYC.entier ||
            kyc.type === TypeReponseQuestionKYC.decimal;

          if (validator.isInt(string_value) && is_kyc_number) {
            const updated_kyc = this.updateQuestionByNGCKeyWithLabel(key, [
              string_value,
            ]);
            result.push(key);
            utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
              updated_kyc,
              utilisateur,
            );
          } else if (validator.isDecimal(string_value) && is_kyc_number) {
            const updated_kyc = this.updateQuestionByNGCKeyWithLabel(key, [
              string_value,
            ]);
            result.push(key);
            utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
              updated_kyc,
              utilisateur,
            );
          } else if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
            const code_reponse = kyc.getCodeByNGCCode(string_value);
            if (code_reponse) {
              const updated_kyc = this.selectChoixUniqueByCode(
                kyc.code,
                code_reponse,
              );
              result.push(key);
              utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
                updated_kyc,
                utilisateur,
              );
            } else {
              console.error(
                `Code NGC [${string_value}] non disponible pour la KYC ${kyc.id_cms}/${kyc.code}`,
              );
            }
          }
        } else {
          console.log(
            `KYC NGC trouvée dans agir [${key}] mais non flaguée NGC !`,
          );
        }
      }
    }
    return result;
  }

  public patchLogement(input: LogementInput) {
    if (input.dpe && this.doesQuestionExistsByCode(KYCID.KYC_DPE)) {
      this.selectChoixUniqueByCode(KYCID.KYC_DPE, input.dpe);
    }
    if (
      input.superficie &&
      this.doesQuestionExistsByCode(KYCID.KYC_superficie)
    ) {
      const value: Record<Superficie, number> = {
        superficie_35: 34,
        superficie_70: 69,
        superficie_100: 99,
        superficie_150: 149,
        superficie_150_et_plus: 200,
      };
      this.updateQuestionByCodeWithLabelOrException(KYCID.KYC_superficie, [
        value[input.superficie].toString(),
      ]);
    }
    if (
      input.proprietaire !== undefined &&
      input.proprietaire !== null &&
      this.doesQuestionExistsByCode(KYCID.KYC_proprietaire)
    ) {
      this.selectChoixUniqueByCode(
        KYCID.KYC_proprietaire,
        input.proprietaire ? 'oui' : 'non',
      );
    }
    if (input.chauffage) {
      const target_KYC: Record<Chauffage, string> = {
        gaz: KYCID.KYC_chauffage_gaz,
        fioul: KYCID.KYC_chauffage_fioul,
        electricite: KYCID.KYC_chauffage_elec,
        bois: KYCID.KYC_chauffage_bois,
        autre: null,
      };

      if (this.doesQuestionExistsByCode(KYCID.KYC_chauffage_gaz)) {
        this.selectChoixUniqueByCode(KYCID.KYC_chauffage_gaz, 'ne_sais_pas');
      }
      if (this.doesQuestionExistsByCode(KYCID.KYC_chauffage_fioul)) {
        this.selectChoixUniqueByCode(KYCID.KYC_chauffage_fioul, 'ne_sais_pas');
      }
      if (this.doesQuestionExistsByCode(KYCID.KYC_chauffage_bois)) {
        this.selectChoixUniqueByCode(KYCID.KYC_chauffage_bois, 'ne_sais_pas');
      }
      if (this.doesQuestionExistsByCode(KYCID.KYC_chauffage_elec)) {
        this.selectChoixUniqueByCode(KYCID.KYC_chauffage_elec, 'ne_sais_pas');
      }
      if (input.chauffage !== Chauffage.autre) {
        if (this.doesQuestionExistsByCode(target_KYC[input.chauffage]))
          this.selectChoixUniqueByCode(target_KYC[input.chauffage], 'oui');
      }
    }

    if (input.nombre_adultes || input.nombre_enfants) {
      if (this.doesQuestionExistsByCode(KYCID.KYC_menage)) {
        this.updateQuestionByCodeWithLabelOrException(KYCID.KYC_menage, [
          '' +
            ((input.nombre_adultes ? input.nombre_adultes : 0) +
              (input.nombre_enfants ? input.nombre_enfants : 0)),
        ]);
      }
    }
    if (input.type) {
      if (this.doesQuestionExistsByCode(KYCID.KYC_type_logement)) {
        this.selectChoixUniqueByCode(
          KYCID.KYC_type_logement,
          input.type === TypeLogement.appartement
            ? 'type_appartement'
            : 'type_maison',
        );
      }
    }
    if (input.plus_de_15_ans !== undefined && input.plus_de_15_ans !== null) {
      if (this.doesQuestionExistsByCode(KYCID.KYC006)) {
        this.selectChoixUniqueByCode(
          KYCID.KYC006,
          input.plus_de_15_ans ? 'plus_15' : 'moins_15',
        );
      }
      if (this.doesQuestionExistsByCode(KYCID.KYC_logement_age)) {
        this.tryUpdateQuestionByCodeWithLabel(KYCID.KYC_logement_age, [
          '' + (input.plus_de_15_ans ? 20 : 5),
        ]);
      }
    }
  }

  public synchroKYCAvecProfileUtilisateur(
    kyc: QuestionKYC,
    utilisateur: Utilisateur,
  ) {
    switch (kyc.code) {
      case KYCID.KYC006:
        utilisateur.logement.plus_de_15_ans =
          kyc.isSelectedReponseCode('plus_15');
        break;
      case KYCID.KYC_logement_age:
        const value = kyc.getReponseSimpleValueAsNumber();
        if (value) {
          utilisateur.logement.plus_de_15_ans = value >= 15;
        }
        break;
      case KYCID.KYC_DPE:
        const code_dpe = kyc.getCodeReponseQuestionChoixUnique();
        utilisateur.logement.dpe = DPE[code_dpe];
        break;
      case KYCID.KYC_superficie:
        const valeur = kyc.getReponseSimpleValueAsNumber();
        if (valeur < 35)
          utilisateur.logement.superficie = Superficie.superficie_35;
        if (valeur < 70)
          utilisateur.logement.superficie = Superficie.superficie_70;
        if (valeur < 100)
          utilisateur.logement.superficie = Superficie.superficie_100;
        if (valeur < 150)
          utilisateur.logement.superficie = Superficie.superficie_150;
        if (valeur >= 150)
          utilisateur.logement.superficie = Superficie.superficie_150_et_plus;
        break;
      case KYCID.KYC_proprietaire:
        const code_prop = kyc.getCodeReponseQuestionChoixUnique();
        utilisateur.logement.proprietaire = code_prop === 'oui';
        break;
      case KYCID.KYC_chauffage:
        const code_chauff = kyc.getCodeReponseQuestionChoixUnique();
        utilisateur.logement.chauffage = Chauffage[code_chauff];
        break;
      case KYCID.KYC_type_logement:
        const code_log = kyc.getCodeReponseQuestionChoixUnique();
        utilisateur.logement.type =
          code_log === 'type_appartement'
            ? TypeLogement.appartement
            : TypeLogement.maison;
        break;
      default:
        break;
    }
  }

  public getKYCsNeverAnswered(
    categorie?: Categorie,
    thematique?: Thematique,
  ): QuestionKYC[] {
    let kycs_all = this.getAllKYCByCategorie(categorie);
    this.answered_questions.forEach((question) => {
      const index = kycs_all.findIndex((d) => d.code === question.code);
      if (index !== -1) {
        kycs_all.splice(index, 1);
      }
    });

    if (thematique) {
      kycs_all = kycs_all.filter(
        (k) => k.thematiques.includes(thematique) || k.thematiques.length === 0,
      );
    }

    return kycs_all;
  }

  private getAllKYCByCategorie(categorie?: Categorie): QuestionKYC[] {
    if (!categorie) {
      return this.catalogue.map((c) => QuestionKYC.buildFromDef(c));
    }
    return this.catalogue
      .filter((c) => c.categorie === categorie)
      .map((c) => QuestionKYC.buildFromDef(c));
  }

  public getUpToDateQuestionByCodeOrException(code: string): QuestionKYC {
    const question_catalogue = this.getKYCDefinitionByCodeOrException(code);
    let answered_question = this.getAnsweredQuestionByCode(code);
    if (answered_question) {
      answered_question.refreshFromDef(question_catalogue);
      return answered_question;
    }
    return QuestionKYC.buildFromDef(question_catalogue);
  }

  private refreshQuestion(kyc: QuestionKYC): QuestionKYC {
    if (!kyc) return null;

    const question_catalogue = this.getKYCDefinitionByCodeOrNull(kyc.code);
    if (question_catalogue) {
      kyc.refreshFromDef(question_catalogue);
    }
    return kyc;
  }

  public getUpToDateQuestionByCodeOrNull(code: string): QuestionKYC {
    const question_catalogue = this.getKYCDefinitionByCodeOrNull(code);
    if (!question_catalogue) {
      return null;
    }

    let answered_question = this.getAnsweredQuestionByCode(code);
    if (answered_question) {
      answered_question.refreshFromDef(question_catalogue);
      return answered_question;
    }
    return QuestionKYC.buildFromDef(question_catalogue);
  }
  public getUpToDateQuestionByCmsIdOrNull(cms_id: number): QuestionKYC {
    const question_catalogue = this.getKYCDefinitionByCmsIdOrNull(cms_id);
    if (!question_catalogue) {
      return null;
    }

    let answered_question = this.getAnsweredQuestionByCMS_ID(cms_id);
    if (answered_question) {
      answered_question.refreshFromDef(question_catalogue);
      return answered_question;
    }
    return QuestionKYC.buildFromDef(question_catalogue);
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
      const kyc = this.getUpToDateQuestionByCodeOrNull(kyc_code);
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
        const kyc = this.getAnsweredQuestionByCMS_ID(cond.id_kyc);
        if (!(kyc && kyc.isSelectedReponseCode(cond.code_reponse))) {
          union = false;
        }
      }
      result = result || union;
    }
    return result;
  }

  public isQuestionAnsweredByCode(code: string): boolean {
    return !!this.getAnsweredQuestionByCode(code);
  }

  public updateQuestionInHistory(question: QuestionKYC) {
    const position = this.answered_questions.findIndex(
      (q) => q.code === question.code,
    );
    if (position >= 0) {
      this.answered_questions[position] = question;
    } else {
      this.answered_questions.push(question);
    }
  }

  // FIXME : DEPRECATED
  public updateQuestionByCodeWithLabelOrException(
    code: string,
    reponses: string[],
  ): QuestionKYC {
    let question = this.getAnsweredQuestionByCode(code);
    if (question) {
      question.setResponseWithValueOrLabels(reponses);
      return question;
    } else {
      let question_catalogue = this.getKYCByCodeFromCatalogueOrException(code);
      question_catalogue.setResponseWithValueOrLabels(reponses);
      this.answered_questions.push(question_catalogue);
      return question_catalogue;
    }
  }
  public updateQuestionByNGCKeyWithLabel(
    ngc_key: string,
    reponses: string[],
  ): QuestionKYC {
    let question = this.getAnsweredQuestionByNGCKey(ngc_key);
    if (question) {
      question.setResponseWithValueOrLabels(reponses);
      return question;
    } else {
      let question_catalogue = this.getKYCByNGCKeyFromCatalogue(ngc_key);
      question_catalogue.setResponseWithValueOrLabels(reponses);
      this.answered_questions.push(question_catalogue);
      return question_catalogue;
    }
  }
  public tryUpdateQuestionByCodeWithLabel(code: string, reponses: string[]) {
    let question = this.getAnsweredQuestionByCode(code);
    if (question) {
      question.setResponseWithValueOrLabels(reponses);
    } else {
      let question_catalogue = this.getKYCByCodeFromCatalogue(code);
      if (question_catalogue) {
        question_catalogue.setResponseWithValueOrLabels(reponses);
        this.answered_questions.push(question_catalogue);
      }
    }
  }

  public trySelectChoixUniqueByCode(
    code_question: string,
    code_reponse: string,
  ) {
    try {
      this.selectChoixUniqueByCode(code_question, code_reponse);
    } catch (error) {
      return;
    }
  }

  public selectChoixUniqueByCode(
    code_question: string,
    code_reponse: string,
  ): QuestionKYC {
    let question = this.getUpToDateAnsweredQuestionByCode(code_question);
    if (question) {
      question.selectChoixUniqueByCode(code_reponse);
      return question;
    } else {
      let question_catalogue =
        this.getKYCByCodeFromCatalogueOrException(code_question);
      question_catalogue.selectChoixUniqueByCode(code_reponse);
      this.answered_questions.push(question_catalogue);
      return question_catalogue;
    }
  }

  public checkQuestionExistsByCode(code_question: string) {
    this.getKYCDefinitionByCodeOrException(code_question);
  }
  public doesQuestionExistsByCode(code_question: string) {
    return !!code_question && this.getKYCDefinitionByCodeOrNull(code_question);
  }

  // FIXME : DEPRECATED (=> refresh version)
  public getAnsweredQuestionByCode(code: string): QuestionKYC {
    const result = this.answered_questions.find(
      (element) => element.code === code,
    );
    if (result) {
      result.is_answererd = true;
    }
    return result;
  }
  public getUpToDateAnsweredQuestionByCode(code: string): QuestionKYC {
    const answered = this.getAnsweredQuestionByCode(code);
    return this.refreshQuestion(answered);
  }
  public getAnsweredQuestionByNGCKey(key: string): QuestionKYC {
    return this.answered_questions.find((element) => element.ngc_key === key);
  }
  public getAnsweredQuestionByCMS_ID(cms_id: number): QuestionKYC {
    const found = this.answered_questions.find(
      (element) => element.id_cms === cms_id,
    );
    return found;
  }

  private getKYCByCodeFromCatalogueOrException(code: string): QuestionKYC {
    const question_def = this.catalogue.find(
      (element) => element.code === code,
    );
    if (!question_def) {
      ApplicationError.throwQuestionInconnue(code);
    }
    return QuestionKYC.buildFromDef(question_def);
  }

  private getKYCByCodeFromCatalogue(code: string): QuestionKYC {
    const question_def = this.catalogue.find(
      (element) => element.code === code,
    );

    if (question_def) {
      return QuestionKYC.buildFromDef(question_def);
    }
    return null;
  }
  private getKYCByNGCKeyFromCatalogue(key: string): QuestionKYC {
    const question_def = this.catalogue.find(
      (element) => element.ngc_key === key,
    );

    if (question_def) {
      return QuestionKYC.buildFromDef(question_def);
    }
    return null;
  }

  private getKYCDefinitionByCodeOrException(code: string): KycDefinition {
    const question_def = this.getKYCDefinitionByCodeOrNull(code);
    if (!question_def) {
      ApplicationError.throwQuestionInconnue(code);
    }
    return question_def;
  }

  private getKYCDefinitionByCodeOrNull(code: string): KycDefinition {
    return this.catalogue.find((element) => element.code === code);
  }
  private getKYCDefinitionByCmsIdOrNull(cms_id: number): KycDefinition {
    return this.catalogue.find((element) => element.id_cms === cms_id);
  }
}
