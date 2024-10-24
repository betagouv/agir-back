import { ApplicationError } from '../../../src/infrastructure/applicationError';
import { Categorie } from '../contenu/categorie';
import { ConditionDefi } from '../defis/conditionDefi';
import { Chauffage, DPE, Superficie, TypeLogement } from '../logement/logement';
import { KYCHistory_v0 as KYCHistory_v0 } from '../object_store/kyc/kycHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { EnchainementQuestions } from './enchainementQuestions';
import { KycDefinition } from './kycDefinition';
import { KYCID } from './KYCID';
import { KYCMosaicID } from './KYCMosaicID';
import { MosaicKYC, MosaicKYCDef } from './mosaicKYC';
import { QuestionGeneric } from './questionGeneric';
import { QuestionKYC, TypeReponseQuestionKYC } from './questionKYC';
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

  constructor(data?: KYCHistory_v0) {
    this.reset();

    if (data && data.answered_questions) {
      data.answered_questions.forEach((element) => {
        this.answered_questions.push(new QuestionKYC(element));
      });
    }
    if (data && data.answered_mosaics) {
      this.answered_mosaics = data.answered_mosaics;
    }
  }

  public getEnchainementKYCsEligibles(
    liste_kycs_ids: string[],
  ): EnchainementQuestions {
    const result: EnchainementQuestions = new EnchainementQuestions();
    for (const kyc_id of liste_kycs_ids) {
      if (MosaicKYC.isMosaicID(kyc_id)) {
        const mosaic = this.getUpToDateMosaicById(KYCMosaicID[kyc_id]);
        if (mosaic) {
          result.addQuestionGeneric({ mosaic: mosaic });
        }
      } else {
        const kyc = this.getUpToDateQuestionByCodeOrNull(kyc_id);

        if (kyc && this.isKYCEligible(kyc)) {
          result.addQuestionGeneric({
            kyc: kyc,
          });
        }
      }
    }
    return result;
  }

  public isKYCEligible(kyc: QuestionKYC) {
    if (!kyc) {
      return false;
    }
    if (!kyc.conditions || kyc.conditions.length === 0) {
      return true;
    }
    return this.areConditionsMatched(kyc.conditions);
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

  public getAllUpToDateQuestionSet(
    kyc_only: boolean = false,
  ): QuestionGeneric[] {
    let result: QuestionGeneric[] = [];

    this.catalogue.forEach((question) => {
      const answered_question = this.getAnsweredQuestionByCode(question.code);
      if (answered_question) {
        answered_question.refreshFromDef(question);
      }
      result.push({
        kyc: answered_question || QuestionKYC.buildFromDef(question),
      });
    });
    if (kyc_only) {
      return result;
    }

    const liste_mosaic_ids = MosaicKYC.listMosaicIDs();
    for (const mosaic_id of liste_mosaic_ids) {
      result.push({
        mosaic: this.getUpToDateMosaicById(mosaic_id),
      });
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
              const updated_kyc = this.updateQuestionByCodeWithCode(
                kyc.id,
                code_reponse,
              );
              result.push(key);
              utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
                updated_kyc,
                utilisateur,
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
    if (input.dpe) {
      this.updateQuestionByCodeWithLabelOrException(KYCID.KYC_DPE, [input.dpe]);
    }
    if (input.superficie) {
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
    if (input.proprietaire !== undefined && input.proprietaire !== null) {
      this.updateQuestionByCodeWithCode(
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

      this.updateQuestionByCodeWithCode(KYCID.KYC_chauffage_gaz, 'ne_sais_pas');
      this.updateQuestionByCodeWithCode(
        KYCID.KYC_chauffage_fioul,
        'ne_sais_pas',
      );
      this.updateQuestionByCodeWithCode(
        KYCID.KYC_chauffage_bois,
        'ne_sais_pas',
      );
      this.updateQuestionByCodeWithCode(
        KYCID.KYC_chauffage_elec,
        'ne_sais_pas',
      );
      if (input.chauffage !== Chauffage.autre) {
        this.updateQuestionByCodeWithCode(target_KYC[input.chauffage], 'oui');
      }
    }

    if (input.nombre_adultes || input.nombre_enfants) {
      this.updateQuestionByCodeWithLabelOrException(KYCID.KYC_menage, [
        '' +
          ((input.nombre_adultes ? input.nombre_adultes : 0) +
            (input.nombre_enfants ? input.nombre_enfants : 0)),
      ]);
    }
    if (input.type) {
      this.updateQuestionByCodeWithCode(
        KYCID.KYC_type_logement,
        input.type === TypeLogement.appartement
          ? 'type_appartement'
          : 'type_maison',
      );
    }
    if (input.plus_de_15_ans !== undefined && input.plus_de_15_ans !== null) {
      this.updateQuestionByCodeWithCode(
        KYCID.KYC006,
        input.plus_de_15_ans ? 'plus_15' : 'moins_15',
      );
    }
  }

  public synchroKYCAvecProfileUtilisateur(
    kyc: QuestionKYC,
    utilisateur: Utilisateur,
  ) {
    switch (kyc.id) {
      case KYCID.KYC006:
        utilisateur.logement.plus_de_15_ans =
          kyc.includesReponseCode('plus_15');
        break;
      case KYCID.KYC_DPE:
        const code_dpe = kyc.getCodeReponseUniqueSaisie();
        utilisateur.logement.dpe = DPE[code_dpe];
        break;
      case KYCID.KYC_superficie:
        const valeur = kyc.getValeurEntiereReponseUniqueSaisie();
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
        const code_prop = kyc.getCodeReponseUniqueSaisie();
        utilisateur.logement.proprietaire = code_prop === 'oui';
        break;
      case KYCID.KYC_chauffage:
        const code_chauff = kyc.getCodeReponseUniqueSaisie();
        utilisateur.logement.chauffage = Chauffage[code_chauff];
        break;
      case KYCID.KYC_type_logement:
        const code_log = kyc.getCodeReponseUniqueSaisie();
        utilisateur.logement.type =
          code_log === 'type_appartement'
            ? TypeLogement.appartement
            : TypeLogement.maison;
        break;
      default:
        break;
    }
  }

  public getKYCRestantes(
    categorie?: Categorie,
    univers?: string,
  ): QuestionKYC[] {
    let kycs_all = this.getAllKYCByCategorie(categorie);
    this.answered_questions.forEach((question) => {
      const index = kycs_all.findIndex((d) => d.id === question.id);
      if (index !== -1) {
        kycs_all.splice(index, 1);
      }
    });

    if (univers) {
      kycs_all = kycs_all.filter(
        (k) => k.universes.includes(univers) || k.universes.length === 0,
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

  public getUpToDateMosaicById(mosaicID: KYCMosaicID): MosaicKYC {
    if (!mosaicID) return null;
    const mosaic_def = MosaicKYC.findMosaicDefByID(mosaicID);
    return this.getUpToDateMosaic(mosaic_def);
  }

  public getUpToDateMosaic(mosaic_def: MosaicKYCDef): MosaicKYC {
    if (!mosaic_def) return null;

    const target_kyc_liste: QuestionKYC[] = [];
    for (const kyc_code of mosaic_def.question_kyc_codes) {
      const kyc = this.getUpToDateQuestionByCodeOrNull(kyc_code);

      if (kyc) {
        target_kyc_liste.push(kyc);
      }
    }

    const result = new MosaicKYC(target_kyc_liste, mosaic_def);
    result.is_answered = this.isMosaicAnswered(mosaic_def.id);

    return result;
  }

  public areConditionsMatched(conditions: ConditionDefi[][]): boolean {
    if (conditions.length === 0) {
      return true;
    }
    let result = false;
    for (const OU of conditions) {
      let union = true;
      for (const cond of OU) {
        const kyc = this.getAnsweredQuestionByCMS_ID(cond.id_kyc);
        if (!(kyc && kyc.includesReponseCode(cond.code_reponse))) {
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

  public updateQuestionByCodeWithLabelOrException(
    code: string,
    reponses: string[],
  ): QuestionKYC {
    let question = this.getAnsweredQuestionByCode(code);
    if (question) {
      question.setResponses(reponses);
      return question;
    } else {
      let question_catalogue = this.getKYCByCodeFromCatalogueOrException(code);
      question_catalogue.setResponses(reponses);
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
      question.setResponses(reponses);
      return question;
    } else {
      let question_catalogue = this.getKYCByNGCKeyFromCatalogue(ngc_key);
      question_catalogue.setResponses(reponses);
      this.answered_questions.push(question_catalogue);
      return question_catalogue;
    }
  }
  public tryUpdateQuestionByCodeWithLabel(code: string, reponses: string[]) {
    let question = this.getAnsweredQuestionByCode(code);
    if (question) {
      question.setResponses(reponses);
    } else {
      let question_catalogue = this.getKYCByCodeFromCatalogue(code);
      if (question_catalogue) {
        question_catalogue.setResponses(reponses);
        this.answered_questions.push(question_catalogue);
      }
    }
  }

  public tryUpdateQuestionByCodeWithCode(
    code_question: string,
    code_reponse: string,
  ) {
    try {
      this.updateQuestionByCodeWithCode(code_question, code_reponse);
    } catch (error) {
      return;
    }
  }

  public updateQuestionByCodeWithCode(
    code_question: string,
    code_reponse: string,
  ): QuestionKYC {
    let question = this.getAnsweredQuestionByCode(code_question);
    if (question) {
      question.setResponseByCode(code_reponse);
      return question;
    } else {
      let question_catalogue =
        this.getKYCByCodeFromCatalogueOrException(code_question);
      question_catalogue.setResponseByCode(code_reponse);
      this.answered_questions.push(question_catalogue);
      return question_catalogue;
    }
  }

  public checkQuestionExistsByCode(questionId: string) {
    this.getKYCDefinitionByCodeOrException(questionId);
  }

  public getAnsweredQuestionByCode(id: string): QuestionKYC {
    return this.answered_questions.find((element) => element.id === id);
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
}
