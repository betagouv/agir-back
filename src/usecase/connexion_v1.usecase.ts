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

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class Connexion_v1_Usecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private securityEmailManager: SecurityEmailManager,
    private passwordManager: PasswordManager,
  ) {}

  async disconnectUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.force_connexion = true;
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async disconnectAllUsers() {
    await this.utilisateurRepository.disconnectAll();
  }

  async loginUtilisateur(
    email: string,
    password: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    if (!email || email === '') {
      ApplicationError.throwMissinEmail();
    }

    if (!password || password === '') {
      ApplicationError.throwMissinPassword();
    }

    const utilisateur = await this.utilisateurRepository.findByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadPasswordOrEmailError();
    }
    if (!utilisateur.active_account) {
      ApplicationError.throwInactiveAccountError();
    }

    const _this = this;
    const okAction = async function () {
      const token = await _this.oidcService.createNewInnerAppToken(
        utilisateur.id,
      );
      return { token: token, utilisateur: utilisateur };
    };

    return this.passwordManager.loginUtilisateur(
      utilisateur,
      password,
      okAction,
    );
  }

  async oubli_mot_de_passe(email: string) {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);

    if (!utilisateur) return; // pas d'erreur, silence ^^

    if (!utilisateur.active_account) return; // pas d'erreur, silence ^^

    const _this = this;
    const okAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      user.setNew6DigitCode();
      user.status = UtilisateurStatus.mot_de_passe_oublie_etape_1;

      await _this.utilisateurRepository.updateUtilisateur(user);

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
      ApplicationError.throwBadCodeOrEmailError();
    }

    if (!utilisateur.active_account) {
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

  private async sendMotDePasseCode(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Voici votre code pour pouvoir modifier votre mot de passe de l'application Agir !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code et modifier le mot de passe, ici le lien : <a href="${App.getBaseURLFront()}/mot-de-passe-oublie/redefinir-mot-de-passe?email=${
        utilisateur.email
      }">Page pour modifier votre mot de passe</a><br><br>
    
À très vite !`,
      `Modification de mot de passe Agir`,
    );
  }
}
