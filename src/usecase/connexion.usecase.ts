import {
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { App } from '../domain/app';

@Injectable()
export class Connexion_v2_Usecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private securityEmailManager: SecurityEmailManager,
    private passwordManager: PasswordManager,
  ) {}

  async loginUtilisateur(email: string, password: string) {
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
    if (!utilisateur.active_account) {
      console.log(`CONNEXION : loginUtilisateur : [${email}] compte inactif`);
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
        _this.sendCodeForConnexion(user);
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
    if (!utilisateur.active_account) {
      console.log(
        `CONNEXION : validateCodePourLogin : [${email}] compte inactif`,
      );
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

      const user = await _this.utilisateurRepository.findByEmail(email);
      user.status = UtilisateurStatus.default;

      await _this.utilisateurRepository.updateUtilisateur(user);

      const token = await _this.oidcService.createNewInnerAppToken(user.id);
      return { token: token, utilisateur: user };
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async oubli_mot_de_passe(email: string) {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);

    if (!utilisateur) {
      console.log(`CONNEXION : oubli_mot_de_pass : [${email}] inconnu`);
      return; // pas d'erreur, silence ^^
    }

    if (!utilisateur.active_account) {
      console.log(`CONNEXION : oubli_mot_de_pass : [${email}] compte inactif`);
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

    if (!utilisateur.active_account) {
      console.log(
        `CONNEXION : modifier_mot_de_passe : [${email}] compte inactif`,
      );
      ApplicationError.throwBadCodeOrEmailError();
    }

    PasswordManager.checkPasswordFormat(mot_de_passe);

    const _this = this;
    const codeOkAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      await _this.securityEmailManager.resetEmailSendingState(user);
      await _this.passwordManager.initLoginState(user);

      user.setPassword(mot_de_passe);
      user.status = UtilisateurStatus.default;

      await _this.utilisateurRepository.updateUtilisateur(user);
      return;
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async disconnectUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    utilisateur.force_connexion = true;
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async disconnectAllUsers() {
    await this.utilisateurRepository.disconnectAll();
  }

  private async sendCodeForConnexion(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour,<br>
Voici votre code pour valider votre connexion à l'application J'agis !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="${App.getBaseURLFront()}/URL_TO_SET">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      `${utilisateur.code} - Votre code connexion à J'agis`,
    );
  }

  private async sendMotDePasseCode(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour,<br>
Voici votre code pour pouvoir modifier votre mot de passe de l'application J'agis !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code et modifier le mot de passe, ici le lien : <a href="${App.getBaseURLFront()}/mot-de-passe-oublie/redefinir-mot-de-passe?email=${
        utilisateur.email
      }">Page pour modifier votre mot de passe</a><br><br>
    
À très vite !`,
      `Modification de mot de passe J'agis`,
    );
  }
}
