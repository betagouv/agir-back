import { Utilisateur } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { v4 as uuidv4 } from 'uuid';
import { Interaction } from '../../src/domain/interaction/interaction';
import { QuizzProfile } from '../../src/domain/quizz/quizzProfile';

@Injectable()
export class UtilisateurUsecase {
  constructor(
    private utilisaturRespository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
  ) {}

  async findUtilisateursByName(name: string): Promise<Utilisateur[]> {
    return this.utilisaturRespository.findUtilisateursByName(name);
  }

  async findUtilisateurByEmail(email: string): Promise<Utilisateur> {
    return this.utilisaturRespository.findUtilisateurByEmail(email);
  }

  async createUtilisateurByName(name: string): Promise<Utilisateur> {
    return this.utilisaturRespository.createUtilisateurByName(name);
  }

  async createUtilisateurByOptionalNameAndEmail(
    name: string,
    email: string,
  ): Promise<Utilisateur> {
    const newUtilisateur = await this.utilisaturRespository.createUtilisateur({
      name: name || 'John Doe '.concat(uuidv4()),
      email: email,
      quizzLevels: QuizzProfile.newLowProfile(),
    });
    await this.initUtilisateurInteractionSet(newUtilisateur.id);
    return newUtilisateur;
  }

  async findUtilisateurById(id: string): Promise<Utilisateur> {
    return this.utilisaturRespository.findUtilisateurById(id);
  }

  async listUtilisateurs(): Promise<Utilisateur[]> {
    return this.utilisaturRespository.listUtilisateur();
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
