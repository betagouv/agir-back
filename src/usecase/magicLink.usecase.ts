import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import { TypeNotification } from '../domain/notification/notificationHistory';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import {
  Scope,
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from './bilanCarbone.usecase';
import { NotificationEmailUsecase } from './notificationEmail.usecase';

export type Phrase = {
  phrase: string;
  pourcent: number;
};
const char_regexp = new RegExp('^[a-zA-Z]+$');

@Injectable()
export class MagicLinkUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private tokenRepository: TokenRepository,
    private codeManager: CodeManager,
    private bilanCarboneUsecase: BilanCarboneUsecase,
    private securityEmailManager: SecurityEmailManager,
    private notificationEmailUsecase: NotificationEmailUsecase,
  ) {}

  async sendLink(
    email: string,
    source: SourceInscription,
    originHost: string,
    originator: string,
    situation_ngc_id?: string,
  ): Promise<void> {
    if (App.isConnexionDown()) {
      ApplicationError.throwConnexionDown(App.getEmailContact());
    }

    if (!email) {
      ApplicationError.throwEmailObligatoireMagicLinkError();
    }
    if (originator) {
      if (!char_regexp.test(originator)) {
        ApplicationError.throwBadOriginParam(originator);
      }
      if (originator.length > 20) {
        ApplicationError.throwBadOriginLength(originator);
      }
    }

    Utilisateur.checkEmailFormat(email);

    let utilisateur = await this.utilisateurRespository.findByEmail(email);

    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        email,
        true,
        SourceInscription[source] || SourceInscription.inconnue,
      );

      if (situation_ngc_id) {
        await this.bilanCarboneUsecase.external_inject_situation_to_user_kycs(
          utilisateur,
          situation_ngc_id,
        );
      }
      await this.utilisateurRespository.createUtilisateur(utilisateur);
    }

    let front_base_url = App.getBaseURLFront();
    if (!App.isProd() && !!originHost) {
      front_base_url = originHost;
    }

    const _this = this;
    const okAction = async function () {
      const user = await _this.utilisateurRespository.getById(utilisateur.id, [
        Scope.core,
      ]);
      user.setNew6DigitCode();
      user.status = UtilisateurStatus.magic_link_etape_1;

      await _this.utilisateurRespository.updateUtilisateurNoConcurency(user, [
        Scope.core,
      ]);
      console.log(`CONNEXION :magic_link : [${user.id}] email sending`);

      _this.sendMagiclink(user, front_base_url, originator);
    };

    await this.securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      okAction,
    );
  }

  async validateLink(
    email: string,
    code: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    if (!email) {
      ApplicationError.throwEmailObligatoireMagicLinkError();
    }
    if (!code) {
      ApplicationError.throwCodeObligatoireMagicLinkError();
    }

    let utilisateur = await this.utilisateurRespository.findByEmail(
      email,
      'full',
    );

    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.code === null) {
      ApplicationError.throwMagicLinkUsedError();
    }
    if (utilisateur.isMagicLinkCodeExpired()) {
      ApplicationError.throwMagicLinkExpiredError();
    }

    const _this = this;
    const codeOkAction = async function () {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      await _this.codeManager.initCodeStateAfterSuccess(utilisateur);

      utilisateur.status = UtilisateurStatus.default;
      utilisateur.active_account = true;
      utilisateur.force_connexion = false;

      await _this.utilisateurRespository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.core],
      );

      const token = await _this.tokenRepository.createNewAppToken(
        utilisateur.id,
      );

      return { token: token, utilisateur: utilisateur };
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  private async sendMagiclink(
    utilisateur: Utilisateur,
    front_base_url: string,
    originator: string,
  ) {
    await this.notificationEmailUsecase.external_send_user_email_of_type(
      TypeNotification.magic_link,
      utilisateur,
      { front_base_url: front_base_url, originator: originator },
    );
  }
}
