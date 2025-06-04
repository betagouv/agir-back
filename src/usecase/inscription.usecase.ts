import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import { TypeNotification } from '../domain/notification/notificationHistory';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import {
  ModeInscription,
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from './bilanCarbone.usecase';
import { NotificationEmailUsecase } from './notificationEmail.usecase';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class InscriptionUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private securityEmailManager: SecurityEmailManager,
    private codeManager: CodeManager,
    private bilanCarboneUseCase: BilanCarboneUsecase,
    private mailerUsecase: NotificationEmailUsecase,
    private tokenRepository: TokenRepository,
  ) {}

  async inscrire_utilisateur(utilisateurInput: CreateUtilisateurAPI) {
    if (App.isInscriptionDown()) {
      ApplicationError.throwInscriptionDown(App.getEmailContact());
    }

    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);

    Utilisateur.checkEmailFormat(utilisateurInput.email);

    const user_existe = await this.utilisateurRespository.does_email_exist(
      utilisateurInput.email,
    );

    if (user_existe) {
      this.sendExistingAccountEmail(utilisateurInput.email);
      return;
    }

    const utilisateurToCreate = Utilisateur.createNewUtilisateur(
      utilisateurInput.email,
      utilisateurInput.source_inscription || SourceInscription.inconnue,
      ModeInscription.mot_de_passe,
    );

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);
    utilisateurToCreate.status = UtilisateurStatus.creation_compte_etape_1;

    if (utilisateurInput.situation_ngc_id) {
      await this.bilanCarboneUseCase.external_inject_situation_to_user_kycs(
        utilisateurToCreate,
        utilisateurInput.situation_ngc_id,
      );
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

      const token = await this.tokenRepository.createNewAppToken(
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
    if (App.isInscriptionDown()) {
      ApplicationError.throwInscriptionDown(App.getEmailContact());
    }
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
    await this.mailerUsecase.external_send_user_email_of_type(
      TypeNotification.inscription_code,
      utilisateur,
      {},
    );
  }
  private async sendExistingAccountEmail(email: string) {
    await this.mailerUsecase.external_send_anonymous_email_of_type(
      TypeNotification.email_existing_account,
      email,
    );
  }
}
