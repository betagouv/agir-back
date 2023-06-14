import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async doIt(username: string): Promise<Object> {
    const utilisateurs = await this.utilisateurRepository.findUtilisateursByName(username);
    if (utilisateurs.length == 0) {
      throw new NotFoundException(`Pas d'utilisateur de nom ${username}`);
    }
    return {
      user: {
        id: utilisateurs[0].id,
        name: utilisateurs[0].name
      },
      compteurs: [],
      quizz: [],
      badges: []
    }
  }
}
