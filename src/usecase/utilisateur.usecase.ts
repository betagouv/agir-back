import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../../src/domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { UtilisateurProfileAPI } from '../infrastructure/api/types/utilisateur/utilisateurProfileAPI';
import { SuiviRepository } from '../infrastructure/repository/suivi.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { QuestionNGCRepository } from '../infrastructure/repository/questionNGC.repository';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { CreateUtilisateurAPI } from '../../src/infrastructure/api/types/utilisateur/createUtilisateurAPI';
import { OnboardingData } from '../../src/domain/utilisateur/onboardingData';

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
  ) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisateurRespository.findUtilisateursByName(name);
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurByEmail(email);
  }

  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    return this.utilisateurRespository.updateProfile(utilisateurId, profile);
  }

  async createUtilisateur(
    utilisateurInput: CreateUtilisateurAPI,
  ): Promise<Utilisateur> {
    try {
      new OnboardingData(utilisateurInput.onboardingData).validateData();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const newUtilisateur = await this.utilisateurRespository.createUtilisateur({
      id: undefined,
      points: 0,
      code_postal: utilisateurInput.onboardingData
        ? utilisateurInput.onboardingData.code_postal
        : undefined,
      created_at: undefined,
      name: utilisateurInput.name || 'Missing Name '.concat(uuidv4()),
      nom: utilisateurInput.nom,
      prenom: utilisateurInput.prenom,
      passwordHash: utilisateurInput.mot_de_passe,
      passwordSalt: uuidv4(),
      email: utilisateurInput.email,
      onboardingData: new OnboardingData(utilisateurInput.onboardingData),
      quizzProfile: UserQuizzProfile.newLowProfile(),
      badges: undefined,
    });
    await this.initUtilisateurInteractionSet(newUtilisateur.id);
    return newUtilisateur;
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

  async initUtilisateurInteractionSet(utilisateurId: string) {
    const interactionDefinitions =
      await this.interactionDefinitionRepository.getAll();

    for (let index = 0; index < interactionDefinitions.length; index++) {
      const interactionDefinition = interactionDefinitions[index];
      await this.interactionRepository.insertInteractionForUtilisateur(
        utilisateurId,
        new Interaction(interactionDefinition),
      );
    }
  }
}
