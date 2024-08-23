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
      ApplicationError.throwBadPasswordOrEmailError();
    }
    if (!utilisateur.active_account) {
      ApplicationError.throwInactiveAccountError();
    }

    const _this = this;
    const okAction = async function () {
      const user = await _this.utilisateurRepository.findByEmail(email);

      user.setNew6DigitCode();
      user.status = UtilisateurStatus.connexion_etape_1;

      await _this.utilisateurRepository.updateUtilisateur(user);

      _this.sendCodeForConnexion(user);
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
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (!utilisateur.active_account) {
      ApplicationError.throwInactiveAccountError();
    }
    if (utilisateur.status !== UtilisateurStatus.connexion_etape_1) {
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

  private async sendCodeForConnexion(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Voici votre code pour valider votre connexion à l'application Agir !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="${App.getBaseURLFront()}/URL_TO_SET">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      `${utilisateur.code} - Votre code connexion à Agir`,
    );
  }
}
