import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { EmailSender } from '../infrastructure/email/emailSender';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { App } from '../domain/app';
import { CreateUtilisateurAPI_v2 } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI_v2';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { ContactUsecase } from './contact.usecase';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class Inscription_v2_Usecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private emailSender: EmailSender,
    private securityEmailManager: SecurityEmailManager,
    private contactUsecase: ContactUsecase,
    private oidcService: OidcService,
    private codeManager: CodeManager,
  ) {}

  async createUtilisateur(utilisateurInput: CreateUtilisateurAPI_v2) {
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);

    Utilisateur.checkEmailFormat(utilisateurInput.email);

    const utilisateurToCreate = Utilisateur.createNewUtilisateur(
      null,
      null,
      utilisateurInput.email,
      null,
      null,
      null,
      false,
      utilisateurInput.source_inscription || SourceInscription.inconnue,
    );

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);
    utilisateurToCreate.status = UtilisateurStatus.creation_compte_etape_1;

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
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour,<br>
Voici votre code pour valider votre inscription à l'application Agir !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="${App.getBaseURLFront()}/validation-compte?email=${
        utilisateur.email
      }">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      `Votre code d'inscription Agir`,
    );
  }
}
