import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurProfileAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../../src/domain/utilisateur/manager/passwordManager';
import { ApplicationError } from '../infrastructure/applicationError';
import { EmailSender } from '../infrastructure/email/emailSender';
import { CodeManager } from '../../src/domain/utilisateur/manager/codeManager';
import { SecurityEmailManager } from '../../src/domain/utilisateur/manager/securityEmailManager';
import { PasswordAwareUtilisateur } from '../../src/domain/utilisateur/manager/passwordAwareUtilisateur';
import { Profile } from '../../src/domain/utilisateur/profile';
import { ServiceRepository } from '../../src/infrastructure/repository/service.repository';
import { GroupeRepository } from '../../src/infrastructure/repository/groupe.repository';
import { QuestionKYCRepository } from '../../src/infrastructure/repository/questionKYC.repository';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

@Injectable()
export class UtilisateurUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private groupeRepository: GroupeRepository,
    private serviceRepository: ServiceRepository,
    private interactionRepository: InteractionRepository,
    private suiviRepository: SuiviRepository,
    private badgeRepository: BadgeRepository,
    private bilanRepository: BilanRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private questionKYCRepository: QuestionKYCRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
    private codeManager: CodeManager,
    private securityEmailManager: SecurityEmailManager,
    private passwordManager: PasswordManager,
  ) {}

  async loginUtilisateur(
    email: string,
    password: string,
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
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
    return this.utilisateurRespository.findUtilisateurByEmail(email);
  }

  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    const profileToUpdate = {} as Profile;

    if (profile.mot_de_passe) {
      PasswordManager.checkPasswordFormat(profile.mot_de_passe);

      // FIXME : code à refacto, pas beau + check non existance utilisateur
      const fakeUser: PasswordAwareUtilisateur = {
        id: null,
        passwordHash: '',
        passwordSalt: '',
        failed_login_count: 0,
        prevent_login_before: new Date(),
      };
      // FIXME : temporaire, faudra suivre un flow avec un code par email
      PasswordManager.setUserPassword(fakeUser, profile.mot_de_passe);
      profileToUpdate.passwordHash = fakeUser.passwordHash;
      profileToUpdate.passwordSalt = fakeUser.passwordSalt;
    }
    // FIXME : c'est tout moche là dessous
    profileToUpdate.code_postal = profile.code_postal;
    profileToUpdate.commune = profile.commune;
    profileToUpdate.revenu_fiscal = profile.revenu_fiscal;
    profileToUpdate.parts = profile.nombre_de_parts_fiscales;
    profileToUpdate.abonnement_ter_loire = profile.abonnement_ter_loire;
    profileToUpdate.email = profile.email;
    profileToUpdate.nom = profile.nom;
    profileToUpdate.prenom = profile.prenom;

    return this.utilisateurRespository.updateProfile(
      utilisateurId,
      profileToUpdate,
    );
  }

  async oubli_mot_de_passe(email: string) {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);

    if (!utilisateur) return; // pas d'erreur, silence ^^

    if (!utilisateur.active_account) return; // pas d'erreur, silence ^^

    const _this = this;
    const okAction = async function () {
      utilisateur.setNew6DigitCode();
      await _this.utilisateurRespository.updateCode(
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

  async modifier_mot_de_passe(
    email: string,
    code: string,
    mot_de_passe: string,
  ) {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);

    if (!utilisateur) return; // pas d'erreur, silence ^^

    if (!utilisateur.active_account) return; // pas d'erreur, silence ^^

    PasswordManager.checkPasswordFormat(mot_de_passe);

    const _this = this;
    const codeOkAction = async function () {
      await _this.securityEmailManager.resetEmailSendingState(utilisateur);
      utilisateur.setPassword(mot_de_passe);
      await _this.utilisateurRespository.updateProfile(utilisateur.id, {
        passwordSalt: utilisateur.passwordSalt,
        passwordHash: utilisateur.passwordHash,
      });
      return;
    };

    return this.codeManager.processInputCodeAndDoActionIfOK(
      code,
      utilisateur,
      codeOkAction,
    );
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurById(id);
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.suiviRepository.delete(utilisateurId);
    await this.questionKYCRepository.delete(utilisateurId);
    await this.interactionRepository.delete(utilisateurId);
    await this.badgeRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.questionNGCRepository.delete(utilisateurId);
    await this.oIDCStateRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.serviceRepository.delete(utilisateurId);
    await this.groupeRepository.delete(utilisateurId);
    await this.utilisateurRespository.delete(utilisateurId);
  }

  private async sendMotDePasseCode(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Voici votre code pour pouvoir modifier votre mot de passe de l'application Agir !<br><br>
    
code : ${utilisateur.code}<br><br>

Si vous n'avez plus la page ouverte pour saisir le code et modifier le mot de passe, ici le lien : <a href="${process.env.BASE_URL_FRONT}/mot-de-passe-oublie/redefinir-mot-de-passe?email=${utilisateur.email}">Page pour modifier votre mot de passe</a><br><br>
    
À très vite !`,
      `Modification de mot de passe Agir`,
    );
  }
}
