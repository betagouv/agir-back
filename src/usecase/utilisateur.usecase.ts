import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurProfileAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { OidcService } from '../../src/infrastructure/auth/oidc.service';
import { EmailSender } from '../../src/infrastructure/email/emailSender';
import { Injectable } from '@nestjs/common';

export type Phrase = {
  phrase: string;
  pourcent: number;
};

const MAUVAIS_MDP_ERROR = `Mauvaise adresse électronique ou mauvais mot de passe`;

@Injectable()
export class UtilisateurUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private suiviRepository: SuiviRepository,
    private badgeRepository: BadgeRepository,
    private bilanRepository: BilanRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private oidcService: OidcService,
    private emailSender: EmailSender,
  ) {}

  async loginUtilisateur(
    email: string,
    password: string,
  ): Promise<{ utilisateur: Utilisateur; token: string }> {
    const utilisateur =
      await this.utilisateurRespository.findUtilisateurByEmail(email);
    if (!utilisateur) {
      throw new Error(MAUVAIS_MDP_ERROR);
    }
    if (!utilisateur.active_account) {
      throw new Error('Utilisateur non actif');
    }
    if (utilisateur.isLoginLocked()) {
      throw new Error(
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLockedUntilString()}`,
      );
    }

    const password_ok = utilisateur.checkPasswordOK(password);
    await this.utilisateurRespository.updateUtilisateurLoginSecurity(
      utilisateur,
    );
    if (password_ok) {
      return {
        utilisateur: utilisateur,
        token: await this.oidcService.createNewInnerAppToken(utilisateur.id),
      };
    }
    if (utilisateur.isLoginLocked()) {
      throw new Error(
        `Trop d'essais successifs, compte bloqué jusqu'à ${utilisateur.getLockedUntilString()}`,
      );
    }
    throw new Error(MAUVAIS_MDP_ERROR);
  }

  async findUtilisateursByNom(nom: string): Promise<Utilisateur[]> {
    return this.utilisateurRespository.findUtilisateursByNom(nom);
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurByEmail(email);
  }

  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    const fakeUser = new Utilisateur({});
    fakeUser.setPassword(profile.mot_de_passe);

    return this.utilisateurRespository.updateProfile(utilisateurId, {
      code_postal: profile.code_postal,
      email: profile.email,
      nom: profile.nom,
      prenom: profile.prenom,
      passwordHash: fakeUser.passwordHash,
      passwordSalt: fakeUser.passwordSalt,
    });
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurById(id);
  }

  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisateurRespository.listUtilisateur();
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.suiviRepository.delete(utilisateurId);
    await this.interactionRepository.delete(utilisateurId);
    await this.badgeRepository.delete(utilisateurId);
    await this.bilanRepository.delete(utilisateurId);
    await this.questionNGCRepository.delete(utilisateurId);
    await this.oIDCStateRepository.delete(utilisateurId);
    await this.utilisateurRespository.delete(utilisateurId);
  }
}
