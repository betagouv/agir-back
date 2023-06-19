import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async doIt(usernameOrId: string): Promise<Object> {
    let utilisateur = await this.utilisateurRepository.findFirstUtilisateursByName(usernameOrId);
    if (utilisateur == null) {
      utilisateur = await this.utilisateurRepository.findUtilisateurById(usernameOrId);
    }
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur de nom ou d'id ${usernameOrId}`);
    }
    const quizzList = await this.quizzRepository.list();
    return {
      user: {
        id: utilisateur.id,
        name: utilisateur.name
      },
      compteurs: [],
      quizz: quizzList,
      badges: []
    }
  }
}
