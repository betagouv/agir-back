import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async doIt(username: string): Promise<Object> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurByNameWithChildren(username);
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur de nom ${username}`);
    }
    return {
      user: {
        id: utilisateur.id,
        name: utilisateur.name
      },
      compteurs: utilisateur["compteurs"],
      quizz: [],
      badges: []
    }
  }
}
