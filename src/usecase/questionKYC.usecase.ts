import { Injectable } from '@nestjs/common';
import validator from 'validator';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KYCMosaicID, MosaicCatalogue } from '../domain/kyc/mosaicDefinition';
import { TypeMosaic } from '../domain/kyc/mosaicKYC';
import { QuestionChoixMultiple } from '../domain/kyc/new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from '../domain/kyc/new_interfaces/QuestionChoixUnique';
import { QuestionSimple } from '../domain/kyc/new_interfaces/QuestionSimple';
import { QuestionKYC, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { BooleanKYC } from '../domain/kyc/QuestionKYCData';
import { KycRegimeToKycRepas } from '../domain/kyc/synchro/kycRegimeToKycRepasSynch';
import { KycToKycSynch } from '../domain/kyc/synchro/kycToKycSynch';
import { KycToProfileSync } from '../domain/kyc/synchro/kycToProfileSync';
import { KycToTags_v2 } from '../domain/kyc/synchro/kycToTagsV2';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { WinterRepository } from '../infrastructure/repository/winter/winter.repository';
import { WinterUsecase } from './winter.usecase';

const FIELD_MAX_LENGTH = 280;

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private personnalisator: Personnalisator,
    private winterUsecase: WinterUsecase,
    private winterRepository: WinterRepository,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = utilisateur.kyc_history.getAllKycsAndMosaics();
    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.kyc],
    );

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getQuestion(
    utilisateurId: string,
    questionId: string,
  ): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let result_kyc: QuestionKYC;

    if (MosaicCatalogue.isMosaicID(questionId)) {
      const mosaic_def = MosaicCatalogue.findMosaicDefByID(
        KYCMosaicID[questionId],
      );

      if (!mosaic_def) {
        ApplicationError.throwUnknownMosaicId(questionId);
      }
      result_kyc = utilisateur.kyc_history.getUpToDateMosaic(mosaic_def);
    } else {
      result_kyc = utilisateur.kyc_history.getQuestion(questionId);
      if (!result_kyc) {
        ApplicationError.throwQuestionInconnue(questionId);
      }
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result_kyc, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async updateResponseKYC_v2(
    utilisateurId: string,
    code_question: string,
    reponse: { code?: string; value?: string; selected?: boolean }[],
  ): Promise<void> {
    if (!reponse || reponse.length === 0) {
      ApplicationError.throwNoKYCResponse(code_question);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.gamification,
        Scope.logement,
        Scope.thematique_history,
        Scope.recommandation,
      ],
    );
    Utilisateur.checkState(utilisateur);

    this.updateQuestionOfCode_v2(code_question, reponse, utilisateur);

    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.logement,
      this.communeRepository,
    ).refreshTagState_v2(utilisateur.recommandation);

    KycToKycSynch.synchro(utilisateur.kyc_history);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    this.updateWinterDataAndRecommandations(utilisateur, [code_question]);
  }

  async skip_KYC(utilisateurId: string, code_question: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    const question_to_update =
      utilisateur.kyc_history.getQuestion(code_question);

    if (!question_to_update) {
      ApplicationError.throwQuestionInconnue(code_question);
    }

    utilisateur.kyc_history.skipQuestion(question_to_update);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async skip_MOSAIC(utilisateurId: string, mosaicId: string): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    const mosaic_def = MosaicCatalogue.findMosaicDefByID(KYCMosaicID[mosaicId]);
    if (!mosaic_def) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    utilisateur.kyc_history.skipMosaic(mosaic_def.id);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private dispatchKYCUpdateToOtherKYCsPostUpdate(
    question: QuestionKYC,
    utilisateur: Utilisateur,
  ) {
    switch (question.code) {
      case KYCID.KYC_alimentation_regime:
        KycRegimeToKycRepas.synchroAlimentationRegime(
          new QuestionChoixUnique(question),
          utilisateur,
        );
        break;
      default:
        break;
    }
  }

  async updateResponseMosaic_v2(
    utilisateurId: string,
    mosaicId: string,
    reponses_code_selected: {
      code: string;
      value?: string;
      selected?: boolean;
    }[],
  ): Promise<void> {
    if (
      !reponses_code_selected ||
      reponses_code_selected.length === undefined ||
      reponses_code_selected.length === 0
    ) {
      ApplicationError.throwMissingMosaicData();
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.gamification,
        Scope.gamification,
        Scope.logement,
        Scope.thematique_history,
        Scope.recommandation,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const mosaic = MosaicCatalogue.findMosaicDefByID(KYCMosaicID[mosaicId]);
    if (!mosaic) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    if (reponses_code_selected.length !== mosaic.question_kyc_codes.length) {
      ApplicationError.throwBadMosaicDataNumber(
        mosaicId,
        mosaic.question_kyc_codes.length,
      );
    }

    for (const code_selected of reponses_code_selected) {
      if (!MosaicCatalogue.hasCode(mosaic.id, code_selected.code)) {
        ApplicationError.throwQuestionBadCodeValue(
          code_selected.code,
          mosaicId,
        );
      }
    }

    const target_kycs: string[] = [];

    if (mosaic.type === TypeMosaic.mosaic_boolean) {
      for (const code_selected of reponses_code_selected) {
        const kyc = utilisateur.kyc_history.getQuestion(code_selected.code);
        if (kyc) {
          if (kyc.type === TypeReponseQuestionKYC.entier) {
            target_kycs.push(kyc.code);
            this.updateQuestionOfCode_v2(
              code_selected.code,
              [{ value: code_selected.selected ? '1' : '0' }],
              utilisateur,
            );
          } else if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
            target_kycs.push(kyc.code);
            this.updateQuestionOfCode_v2(
              code_selected.code,
              [
                {
                  code: code_selected.selected
                    ? BooleanKYC.oui
                    : BooleanKYC.non,
                  selected: true,
                },
              ],
              utilisateur,
            );
          } else {
            ApplicationError.throwBadMosaiConfigurationError(mosaicId);
          }
        }
      }
    }

    utilisateur.kyc_history.addAnsweredMosaic(mosaic.id);

    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.logement,
      this.communeRepository,
    ).refreshTagState_v2(utilisateur.recommandation);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    this.updateWinterDataAndRecommandations(utilisateur, target_kycs);
  }

  private updateQuestionOfCode_v2(
    code_question: string,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
    utilisateur: Utilisateur,
  ) {
    const question_to_update =
      utilisateur.kyc_history.getQuestion(code_question);

    if (!question_to_update) {
      ApplicationError.throwQuestionInconnue(code_question);
    }

    if (question_to_update.isSimpleQuestion()) {
      this.updateSimpleQuestion(
        new QuestionSimple(question_to_update),
        input_reponse_payload,
      );
    }
    if (question_to_update.isChoixUnique()) {
      this.updateQuestionChoixUnique(
        new QuestionChoixUnique(question_to_update),
        input_reponse_payload,
      );
    }
    if (question_to_update.isChoixMultiple()) {
      this.updateQuestionChoixMultiple(
        new QuestionChoixMultiple(question_to_update),
        input_reponse_payload,
      );
    }
    utilisateur.kyc_history.updateQuestion(question_to_update);

    KycToProfileSync.synchronize(question_to_update, utilisateur);

    this.dispatchKYCUpdateToOtherKYCsPostUpdate(
      question_to_update,
      utilisateur,
    );

    utilisateur.recomputeRecoTags();
  }

  private updateSimpleQuestion(
    kyc: QuestionSimple,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    if (input_reponse_payload.length !== 1) {
      ApplicationError.throwUniqueReponseExpected(kyc.getCode());
    }
    if (!input_reponse_payload[0].value) {
      ApplicationError.throwMissingValue(kyc.getCode());
    }

    const input = input_reponse_payload[0].value;

    if (input.length > FIELD_MAX_LENGTH) {
      ApplicationError.throwTooBigData('value', input, FIELD_MAX_LENGTH);
    }

    if (kyc.isInteger()) {
      if (!validator.isInt('' + input))
        ApplicationError.throwKycNoInteger(input);
      kyc.setStringValue(input);
      return;
    }

    if (kyc.isDecimal()) {
      const alt_decimal = input.replace(',', '.');
      if (!validator.isDecimal('' + alt_decimal))
        ApplicationError.throwKycNoDecimal(input);
      kyc.setStringValue(alt_decimal);
      return;
    }

    kyc.setStringValue(input);
  }
  private updateQuestionChoixUnique(
    kyc: QuestionChoixUnique,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    let already_found = false;

    let target_code = null;

    for (const code_selected_element of input_reponse_payload) {
      target_code = code_selected_element.selected
        ? code_selected_element.code
        : null;

      if (!!target_code && already_found) {
        ApplicationError.throwToManySelectedAttributesForKYC(
          kyc.getCode(),
          target_code,
        );
      }

      if (target_code) {
        kyc.selectByCode(target_code);
        already_found = true;
      }
    }
    if (!already_found) {
      ApplicationError.throwNoneSelectedButNeededOne(kyc.getCode());
    }
  }

  private updateQuestionChoixMultiple(
    kyc: QuestionChoixMultiple,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    const code_liste = kyc.getAllCodes();
    for (const code_ref of code_liste) {
      const answered_element = input_reponse_payload.find(
        (r) => r.code === code_ref,
      );
      if (!answered_element) {
        ApplicationError.throwMissingValueForCode(kyc.getCode(), code_ref);
      }
      if (
        answered_element.selected === undefined ||
        answered_element.selected === null
      ) {
        ApplicationError.throwMissingSelectedAttributeForCode(
          kyc.getCode(),
          code_ref,
        );
      }
      kyc.setCodeState(code_ref, answered_element.selected);
    }
  }

  private async updateWinterDataAndRecommandations(
    utilisateur: Utilisateur,
    kyc_codes: string[],
  ) {
    if (!this.winterRepository.isAnyKycMapped(kyc_codes)) {
      return;
    }

    await this.winterUsecase.external_synchroniser_data_logement(utilisateur);

    await this.winterUsecase.external_update_winter_recommandation(utilisateur);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }
}
