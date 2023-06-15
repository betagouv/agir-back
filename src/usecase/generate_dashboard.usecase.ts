import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private quizzRepository: QuizzRepository,
  ) {}

  async doIt(username: string): Promise<Object> {
    const utilisateur = await this.utilisateurRepository.findUtilisateurByNameWithChildren(username);
    const quizzList = await this.quizzRepository.list();
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur de nom ${username}`);
    }
    return {
      user: {
        id: utilisateur.id,
        name: utilisateur.name
      },
      compteurs: utilisateur["compteurs"],
      quizz: quizzList,
      badges: []
    }
  }
}
