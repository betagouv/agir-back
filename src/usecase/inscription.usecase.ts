import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { ContactUsecase } from './contact.usecase';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { SituationNGCRepository } from '../infrastructure/repository/bilan.repository';
import { MailerUsecase } from './mailer.usecase';
import { TypeNotification } from '../domain/notification/notificationHistory';
import { KYCID } from '../domain/kyc/KYCID';
import { BooleanKYC } from '../domain/kyc/questionKYC';
import { Feature } from '../domain/gamification/feature';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class InscriptionUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private securityEmailManager: SecurityEmailManager,
    private contactUsecase: ContactUsecase,
    private oidcService: OidcService,
    private codeManager: CodeManager,
    private kycRepository: KycRepository,
    private bilanRepository: SituationNGCRepository,
    private mailerUsecase: MailerUsecase,
  ) {}

  async createUtilisateur(utilisateurInput: CreateUtilisateurAPI) {
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);

    Utilisateur.checkEmailFormat(utilisateurInput.email);

    const utilisateurToCreate = Utilisateur.createNewUtilisateur(
      utilisateurInput.email,
      false,
      utilisateurInput.source_inscription || SourceInscription.inconnue,
    );

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);
    utilisateurToCreate.status = UtilisateurStatus.creation_compte_etape_1;

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateurToCreate.kyc_history.setCatalogue(kyc_catalogue);

    if (utilisateurInput.situation_ngc_id) {
      utilisateurToCreate.parcours_todo.dropLastMission();
      utilisateurToCreate.unlocked_features.add(Feature.bilan_carbone);

      const situation = await this.bilanRepository.getSituationNGCbyId(
        utilisateurInput.situation_ngc_id,
      );
      if (situation) {
        utilisateurToCreate.kyc_history.tryUpdateQuestionByCodeWithCode(
          KYCID.KYC_bilan,
          BooleanKYC.oui,
        );
        const updated_keys = utilisateurToCreate.kyc_history.injectSituationNGC(
          situation.situation as any,
          utilisateurToCreate,
        );

        utilisateurToCreate.kyc_history.flagMosaicsAsAnsweredWhenAtLeastOneQuestionAnswered();

        if (updated_keys.length > 0) {
          console.log(
            `Updated NGC kycs for ${
              utilisateurInput.email
            } : ${updated_keys.join('|')}`,
          );
        }
      }
    }

    await this.utilisateurRespository.createUtilisateur(utilisateurToCreate);

    this.sendValidationCode(utilisateurToCreate);
  }

  async validateCode(email: string, code: string): Promise<{ token: string }> {
    const utilisateur = await this.utilisateurRespository.findByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
    }
    const _this = this;

    const codeOkAction = async () => {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      await _this.utilisateurRespository.activateAccount(utilisateur.id);
      await _this.contactUsecase.create(utilisateur);

      const token = await _this.oidcService.createNewInnerAppToken(
        utilisateur.id,
      );
      return { token };
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async renvoyerCodeInscription(email: string) {
    const utilisateur = await this.utilisateurRespository.findByEmail(email);
    if (!utilisateur) {
      return;
    }

    utilisateur.setNew6DigitCode();
    await this.utilisateurRespository.updateCode(
      utilisateur.id,
      utilisateur.code,
      utilisateur.code_generation_time,
    );
    const _this = this;

    const okAction = async function () {
      _this.sendValidationCode(utilisateur);
    };

    await this.securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      okAction,
    );
  }

  private async sendValidationCode(utilisateur: Utilisateur) {
    await this.mailerUsecase.sendEmailOfType(
      TypeNotification.inscription_code,
      utilisateur,
    );
  }
}
