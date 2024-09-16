import {
  SourceInscription,
  Utilisateur,
} from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI';
import { EmailSender } from '../infrastructure/email/emailSender';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { ContactUsecase } from './contact.usecase';
import { App } from '../domain/app';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class Inscription_v1_Usecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private contactUsecase: ContactUsecase,
    private oidcService: OidcService,
    private securityEmailManager: SecurityEmailManager,
  ) {}

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

  async createUtilisateur_v2(utilisateurInput: CreateUtilisateurAPI) {
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);
    Utilisateur.checkEmailFormat(utilisateurInput.email);

    const utilisateurToCreate = Utilisateur.createNewUtilisateur(
      utilisateurInput.nom,
      utilisateurInput.prenom,
      utilisateurInput.email,
      utilisateurInput.annee_naissance,
      utilisateurInput.code_postal,
      utilisateurInput.commune,
      false,
      utilisateurInput.source_inscription || SourceInscription.inconnue,
    );

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);

    await this.utilisateurRespository.createUtilisateur(utilisateurToCreate);

    this.sendValidationCode(utilisateurToCreate);
  }

  async createUtilisateur(utilisateurInput: CreateUtilisateurAPI) {
    this.checkInputToCreateUtilisateur(utilisateurInput);

    if (App.isWhiteListeEnabled()) {
      if (!App.doesAnyWhiteListIncludes(utilisateurInput.email)) {
        ApplicationError.throwNotAuthorizedEmailError();
      }
    }

    /*
    const onboarding = new Onboarding(
      OnboardingDataAPI.convertToDomain(utilisateurInput.onboardingData),
    );
    */

    const utilisateurToCreate = Utilisateur.createNewUtilisateur(
      utilisateurInput.nom,
      utilisateurInput.prenom,
      utilisateurInput.email,
      utilisateurInput.annee_naissance,
      utilisateurInput.code_postal,
      utilisateurInput.commune,
      false,
      utilisateurInput.source_inscription || SourceInscription.inconnue,
    );

    utilisateurToCreate.setNew6DigitCode();

    utilisateurToCreate.setPassword(utilisateurInput.mot_de_passe);

    await this.utilisateurRespository.createUtilisateur(utilisateurToCreate);

    this.sendValidationCode(utilisateurToCreate);
  }

  async renvoyerCode(email: string) {
    const utilisateur = await this.utilisateurRespository.findByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
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

  private checkInputToCreateUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ) {
    /*
    new Onboarding(
      OnboardingDataAPI.convertToDomain(utilisateurInput.onboardingData),
    ).validateData();
    */

    if (!utilisateurInput.nom) {
      ApplicationError.throwNomObligatoireError();
    }
    if (!utilisateurInput.prenom) {
      ApplicationError.throwPrenomObligatoireError();
    }
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
    }
    if (!utilisateurInput.code_postal || !utilisateurInput.commune) {
      ApplicationError.throwCodePostalObligatoireError();
    }

    PasswordManager.checkPasswordFormat(utilisateurInput.mot_de_passe);
    Utilisateur.checkEmailFormat(utilisateurInput.email);
  }

  private async sendValidationCode(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
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
