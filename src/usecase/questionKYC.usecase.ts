import { Injectable } from '@nestjs/common';
import validator from 'validator';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { MosaicKYC_CATALOGUE, TypeMosaic } from '../domain/kyc/mosaicKYC';
import { QuestionChoixMultiple } from '../domain/kyc/new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from '../domain/kyc/new_interfaces/QuestionChoixUnique';
import { QuestionSimple } from '../domain/kyc/new_interfaces/QuestionSimple';
import { QuestionKYC, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { BooleanKYC } from '../domain/kyc/QuestionKYCData';
import { KycRegimeToKycRepas } from '../domain/kyc/synchro/kycRegimeToKycRepas';
import { KycToProfileSync } from '../domain/kyc/synchro/kycToProfileSync';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';

const FIELD_MAX_LENGTH = 280;

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = utilisateur.kyc_history.getAllUpToDateQuestionSet();
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

    if (MosaicKYC_CATALOGUE.isMosaicID(questionId)) {
      const mosaic_def = MosaicKYC_CATALOGUE.findMosaicDefByID(
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
        Scope.gamification,
        Scope.logement,
        Scope.thematique_history,
      ],
    );
    Utilisateur.checkState(utilisateur);

    this.updateQuestionOfCode_v2(code_question, reponse, utilisateur);

    utilisateur.thematique_history.recomputeTagExcluant(
      utilisateur.kyc_history,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private dispatchKYCUpdateToOtherKYCsPostUpdate(
    code_question: string,
    utilisateur: Utilisateur,
  ) {
    const question_depart =
      utilisateur.kyc_history.getUpToDateAnsweredQuestionByCode(code_question);
    switch (question_depart.code) {
      case KYCID.KYC_alimentation_regime:
        KycRegimeToKycRepas.synchroAlimentationRegime(
          new QuestionChoixUnique(question_depart),
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
      ],
    );
    Utilisateur.checkState(utilisateur);

    const mosaic = MosaicKYC_CATALOGUE.findMosaicDefByID(KYCMosaicID[mosaicId]);
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
      if (!MosaicKYC_CATALOGUE.hasCode(mosaic.id, code_selected.code)) {
        ApplicationError.throwQuestionBadCodeValue(
          code_selected.code,
          mosaicId,
        );
      }
    }

    if (mosaic.type === TypeMosaic.mosaic_boolean) {
      for (const code_selected of reponses_code_selected) {
        const kyc = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          code_selected.code,
        );
        if (kyc) {
          if (kyc.type === TypeReponseQuestionKYC.entier) {
            this.updateQuestionOfCode_v2(
              code_selected.code,
              [{ value: code_selected.selected ? '1' : '0' }],
              utilisateur,
            );
            //kyc.setReponseSimpleValue(code_selected.selected ? '1' : '0');
          } else if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
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
            //kyc.selectChoixUniqueByCode(code_selected.selected ? BooleanKYC.oui : BooleanKYC.non);
          } else {
            ApplicationError.throwBadMosaiConfigurationError(mosaicId);
          }
        }
      }
    }

    utilisateur.kyc_history.addAnsweredMosaic(mosaic.id);

    utilisateur.thematique_history.recomputeTagExcluant(
      utilisateur.kyc_history,
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
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

    this.dispatchKYCUpdateToOtherKYCsPostUpdate(code_question, utilisateur);

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
      kyc.setValue(input);
      return;
    }

    if (kyc.isDecimal()) {
      const alt_decimal = input.replace(',', '.');
      if (!validator.isDecimal('' + alt_decimal))
        ApplicationError.throwKycNoDecimal(input);
      kyc.setValue(alt_decimal);
      return;
    }

    kyc.setValue(input);
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
}
