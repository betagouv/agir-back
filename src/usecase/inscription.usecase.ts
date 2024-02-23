import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { CreateUtilisateurAPI } from '../infrastructure/api/types/utilisateur/onboarding/createUtilisateurAPI';
import { Onboarding } from '../domain/utilisateur/onboarding/onboarding';
import { OnboardingDataAPI } from '../infrastructure/api/types/utilisateur/onboarding/onboardingDataAPI';
import { OnboardingResult } from '../domain/utilisateur/onboarding/onboardingResult';
import { EmailSender } from '../infrastructure/email/emailSender';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { CodeManager } from '../domain/utilisateur/manager/codeManager';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { SecurityEmailManager } from '../domain/utilisateur/manager/securityEmailManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { Gamification } from '../domain/gamification/gamification';
import { ParcoursTodo } from '../domain/todo/parcoursTodo';
import { UnlockedFeatures } from '../domain/gamification/unlockedFeatures';
import { History } from '../domain/history/history';
import { UtilisateurBehavior } from '../domain/utilisateur/utilisateurBehavior';
import { KYC } from '../domain/kyc/collectionQuestionsKYC';
import { Equipements } from '../domain/equipements/equipements';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class InscriptionUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private oidcService: OidcService,
    private securityEmailManager: SecurityEmailManager,
  ) {}

  async validateCode(
    email: string,
    code: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    const utilisateur = await this.utilisateurRespository.findByEmail(email);
    if (!utilisateur) {
      ApplicationError.throwBadCodeOrEmailError();
    }
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
    }

    const _this = this;
    const codeOkAction = async function () {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      await _this.utilisateurRespository.activateAccount(utilisateur.id);

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

  async createUtilisateur(utilisateurInput: CreateUtilisateurAPI) {
    this.checkInputToCreateUtilisateur(utilisateurInput);

    if (process.env.WHITE_LIST_ENABLED === 'true') {
      if (
        !process.env.WHITE_LIST.toLowerCase().includes(
          utilisateurInput.email.toLowerCase(),
        )
      ) {
        ApplicationError.throwNotAuthorizedEmailError();
      }
    }

    const onboarding = new Onboarding(
      OnboardingDataAPI.convertToDomain(utilisateurInput.onboardingData),
    );

    const utilisateurToCreate = new Utilisateur({
      id: undefined,
      code_postal: onboarding.code_postal,
      commune: onboarding.commune,
      created_at: undefined,
      nom: utilisateurInput.nom,
      prenom: utilisateurInput.prenom,
      email: utilisateurInput.email,
      onboardingData: onboarding,
      onboardingResult: OnboardingResult.buildFromOnboarding(onboarding),
      revenu_fiscal: null,
      parts: null,
      abonnement_ter_loire: false,
      passwordHash: null,
      passwordSalt: null,
      active_account: false,
      code: null,
      code_generation_time: null,
      failed_checkcode_count: 0,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      prevent_checkcode_before: new Date(),
      sent_email_count: 1,
      prevent_sendemail_before: new Date(),
      parcours_todo: new ParcoursTodo(),
      gamification: new Gamification(),
      unlocked_features: new UnlockedFeatures(),
      history: new History(),
      code_departement: null,
      kyc: new KYC(),
      equipements: new Equipements(),
      prm: null,
      version: UtilisateurBehavior.systemVersion(),
      migration_enabled: false,
      version_ponderation: UtilisateurBehavior.ponderationSystemVersion(),
    });

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
    if (utilisateur.active_account) {
      ApplicationError.throwCompteDejaActifError();
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
    new Onboarding(
      OnboardingDataAPI.convertToDomain(utilisateurInput.onboardingData),
    ).validateData();

    if (!utilisateurInput.nom) {
      ApplicationError.throwNomObligatoireError();
    }
    if (!utilisateurInput.prenom) {
      ApplicationError.throwPrenomObligatoireError();
    }
    if (!utilisateurInput.email) {
      ApplicationError.throwEmailObligatoireError();
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

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="${process.env.BASE_URL_FRONT}/validation-compte?email=${utilisateur.email}">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      `Votre code d'inscription Agir`,
    );
  }
}
