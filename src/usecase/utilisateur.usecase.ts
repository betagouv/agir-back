import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import {
  LogementAPI,
  TransportAPI,
  UtilisateurProfileAPI,
} from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../../src/domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CodeManager } from '../../src/domain/utilisateur/manager/codeManager';
import { SecurityEmailManager } from '../../src/domain/utilisateur/manager/securityEmailManager';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { GroupeRepository } from '../../src/infrastructure/repository/groupe.repository';
import { ContactUsecase } from './contact.usecase';
import { App } from '../../src/domain/app';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Retryable } from 'typescript-retry-decorator';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class UtilisateurUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private groupeRepository: GroupeRepository,
    private serviceRepository: ServiceRepository,
    private suiviRepository: SuiviRepository,
    private bilanRepository: BilanRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private securityEmailManager: SecurityEmailManager,
    private passwordManager: PasswordManager,
    private contactUsecase: ContactUsecase,
    private kycRepository: KycRepository,
  ) {}

  async computeAllUsersRecoTags() {
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];
      const utilisateur = await this.utilisateurRepository.getById(user_id);

      const catalogue = await this.kycRepository.getAllDefs();
      utilisateur.kyc_history.setCatalogue(catalogue);

      utilisateur.recomputeRecoTags();
      await this.utilisateurRepository.updateUtilisateur(utilisateur);
    }
  }

  async reset(confirmation: string, utilisateurId: string) {
    if (confirmation !== 'CONFIRMATION RESET') {
      ApplicationError.throwMissingResetConfirmation();
    }
    await this.resetUser(utilisateurId);
  }

  async disconnectUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.force_connexion = true;
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async disconnectAllUsers() {
    await this.utilisateurRepository.disconnectAll();
  }

  async resetAllUsers(confirmation: string) {
    if (confirmation !== 'CONFIRMATION RESET') {
      ApplicationError.throwMissingResetConfirmation();
    }
    const userIdList = await this.utilisateurRepository.listUtilisateurIds();
    for (let index = 0; index < userIdList.length; index++) {
      const user_id = userIdList[index];

      await this.resetUser(user_id);
    }
  }

  async loginUtilisateur(
    email: string,
    password: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
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

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRepository.findByEmail(email);
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    if (profile.mot_de_passe) {
      PasswordManager.checkPasswordFormat(profile.mot_de_passe);
      PasswordManager.setUserPassword(utilisateur, profile.mot_de_passe);
    }

    utilisateur.revenu_fiscal = profile.revenu_fiscal;
    utilisateur.parts = profile.nombre_de_parts_fiscales;
    utilisateur.abonnement_ter_loire = profile.abonnement_ter_loire;
    utilisateur.email = profile.email;
    utilisateur.nom = profile.nom;
    utilisateur.prenom = profile.prenom;
    utilisateur.annee_naissance = profile.annee_naissance;

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurTransport(utilisateurId: string, input: TransportAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    utilisateur.transport.patch(input);

    utilisateur.recomputeRecoTags();

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  @Retryable({
    maxAttempts: 1,
    doRetry: (e: any) => {
      return e.code === '050';
    },
  })
  async updateUtilisateurLogement(utilisateurId: string, input: LogementAPI) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    utilisateur.logement.patch(input, utilisateur);

    if (input.plus_de_15_ans !== undefined && input.plus_de_15_ans !== null) {
      utilisateur.kyc_history.updateQuestion(KYCID.KYC006, [
        input.plus_de_15_ans ? 'plus_15' : 'moins_15',
      ]);
    }

    utilisateur.recomputeRecoTags();

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  async oubli_mot_de_passe(email: string) {
    const utilisateur = await this.utilisateurRepository.findByEmail(email);

    if (!utilisateur) return; // pas d'erreur, silence ^^

    if (!utilisateur.active_account) return; // pas d'erreur, silence ^^

    const _this = this;
    const okAction = async function () {
      utilisateur.setNew6DigitCode();
      await _this.utilisateurRepository.updateCode(
        utilisateur.id,
        utilisateur.code,
        utilisateur.code_generation_time,
      );
      _this.sendMotDePasseCode(utilisateur);
    };

    await this.securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      okAction,
    );
  }

  private async resetUser(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    utilisateur.resetAllHistory();

    await this.serviceRepository.deleteAllUserServices(utilisateurId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
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
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      await _this.passwordManager.initLoginState(utilisateur);

      utilisateur.setPassword(mot_de_passe);
      await _this.utilisateurRepository.updateUtilisateur(utilisateur);
      return;
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurRepository.getById(id);
    if (utilisateur) utilisateur.checkState();

    return utilisateur;
  }

  async deleteUtilisateur(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    await this.suiviRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.oIDCStateRepository.delete(utilisateurId);
    await this.serviceRepository.deleteAllUserServices(utilisateurId);
    await this.groupeRepository.delete(utilisateurId);
    await this.utilisateurRepository.delete(utilisateurId);

    await this.contactUsecase.delete(utilisateur.email);
  }

  private AorB?<T>(a: T, b: T): T {
    if (a === undefined) return b;
    return a;
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
