import { Utilisateur } from '../../src/domain/utilisateur';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../../src/domain/interaction/interaction';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { UtilisateurProfileAPI } from '../../src/infrastructure/api/types/utilisateurProfileAPI';

@Injectable()
export class UtilisateurUsecase {
  constructor(
    private utilisateurRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
  ) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisateurRespository.findUtilisateursByName(name);
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisateurRespository.findUtilisateurByEmail(email);
  }

  async createUtilisateurByName(name: string): Promise<Utilisateur> {
    return this.utilisateurRespository.createUtilisateurByName(name);
  }
  async updateUtilisateurProfile(
    utilisateurId: string,
    profile: UtilisateurProfileAPI,
  ) {
    return this.utilisateurRespository.updateProfile(utilisateurId, profile);
  }

  async createUtilisateurByOptionalNameAndEmail(
    name: string,
    email: string,
  ): Promise<Utilisateur> {
    const newUtilisateur = await this.utilisateurRespository.createUtilisateur({
      id: undefined,
      points: 0,
      code_postal: undefined,
      created_at: undefined,
      name: name || 'John Doe '.concat(uuidv4()),
      email: email,
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
