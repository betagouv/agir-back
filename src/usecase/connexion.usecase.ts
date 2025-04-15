import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import { TypeNotification } from '../domain/notification/notificationHistory';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import {
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { FranceConnectUsecase } from './franceConnect.usecase';
import { NotificationEmailUsecase } from './notificationEmail.usecase';

@Injectable()
export class Connexion_v2_Usecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private codeManager: CodeManager,
    private securityEmailManager: SecurityEmailManager,
    private passwordManager: PasswordManager,
    private mailerUsecase: NotificationEmailUsecase,
    private franceConnectUsecase: FranceConnectUsecase,
    private tokenRepository: TokenRepository,
  ) {}

  async loginUtilisateur(email: string, password: string) {
    if (App.isConnexionDown()) {
      ApplicationError.throwConnexionDown(App.getEmailContact());
    }

    if (!email || email === '') {
      ApplicationError.throwMissinEmail();
    }

    if (!password || password === '') {
      ApplicationError.throwMissinPassword();
    }

    const utilisateur = await this.utilisateurRepository.findByEmail(email);
    if (!utilisateur) {
      console.log(`CONNEXION : loginUtilisateur : [${email}] mauvais email`);
      ApplicationError.throwBadPasswordOrEmailError();
    }

    const _this = this;
    const okAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      user.setNew6DigitCode();
      user.status = UtilisateurStatus.connexion_etape_1;

      await _this.utilisateurRepository.updateUtilisateur(user);

      if (
        user.email !== App.getGoogleTestEmail() &&
        user.email !== App.getAppleTestEmail()
      ) {
        _this.sendConnexionCode(user);
      }
    };

    return this.passwordManager.loginUtilisateur(
      utilisateur,
      password,
      okAction,
    );
  }

  async validateCodePourLogin(
    email: string,
    code: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);
    if (!utilisateur) {
      console.log(`CONNEXION : validateCodePourLogin : [${email}] inconnu`);
      ApplicationError.throwBadCodeOrEmailError();
    }

    if (utilisateur.status !== UtilisateurStatus.connexion_etape_1) {
      console.log(
        `CONNEXION : validateCodePourLogin : [${email}] mauvaise étape`,
      );
      ApplicationError.throwBadCodeOrEmailError();
    }

    const _this = this;

    const codeOkAction = async () => {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);

      const user = await _this.utilisateurRepository.findByEmail(email, 'full');
      user.status = UtilisateurStatus.default;

      await _this.utilisateurRepository.activateAccount(utilisateur.id);
      await _this.utilisateurRepository.updateUtilisateur(user);

      const token = await _this.tokenRepository.createNewAppToken(user.id);
      return { token: token, utilisateur: user };
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async oubli_mot_de_passe(email: string) {
    if (App.isConnexionDown()) {
      ApplicationError.throwConnexionDown(App.getEmailContact());
    }

    const utilisateur = await this.utilisateurRepository.findByEmail(email);

    if (!utilisateur) {
      console.log(`CONNEXION : oubli_mot_de_pass : [${email}] inconnu`);
      return; // pas d'erreur, silence ^^
    }

    const _this = this;
    const okAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      user.setNew6DigitCode();
      user.status = UtilisateurStatus.mot_de_passe_oublie_etape_1;

      await _this.utilisateurRepository.updateUtilisateur(user);
      console.log(
        `CONNEXION : oubli_mot_de_passe : [${utilisateur.id}] email sending`,
      );

      _this.sendMotDePasseCode(user);
    };

    await this.securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      okAction,
    );
  }

  async modifier_mot_de_passe(
    email: string,
    code: string,
    mot_de_passe: string,
  ) {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);

    if (!utilisateur) {
      console.log(
        `CONNEXION : modifier_mot_de_passe : [${email}] compte inconnu`,
      );
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.status !== UtilisateurStatus.mot_de_passe_oublie_etape_1) {
      console.log(
        `CONNEXION : validateCodePourModifMotDePasse : [${email}] mauvaise étape`,
      );
      ApplicationError.throwBadCodeOrEmailError();
    }

    PasswordManager.checkPasswordFormat(mot_de_passe);

    const _this = this;
    const codeOkAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      await _this.securityEmailManager.resetEmailSendingState(user);
      await _this.passwordManager.initLoginStateAfterSuccess(user);

      user.setPassword(mot_de_passe);
      user.status = UtilisateurStatus.default;

      await _this.utilisateurRepository.activateAccount(utilisateur.id);
      await _this.utilisateurRepository.updateUtilisateur(user);
      return;
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async logout_single_user(
    utilisateurId: string,
  ): Promise<{ fc_logout_url?: URL }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    utilisateur.force_connexion = true;
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    if (App.isProd()) {
      return {}; // PAS de FC encore en PROD
    } else {
      const result =
        await this.franceConnectUsecase.external_logout_france_connect(
          utilisateurId,
        );
      return { fc_logout_url: result.fc_logout_url };
    }
  }

  async logout_all_users() {
    await this.utilisateurRepository.disconnectAll();
  }

  private async sendConnexionCode(utilisateur: Utilisateur) {
    await this.mailerUsecase.external_send_user_email_of_type(
      TypeNotification.connexion_code,
      utilisateur,
    );
  }

  private async sendMotDePasseCode(utilisateur: Utilisateur) {
    await this.mailerUsecase.external_send_user_email_of_type(
      TypeNotification.change_mot_de_passe_code,
      utilisateur,
    );
  }
}
