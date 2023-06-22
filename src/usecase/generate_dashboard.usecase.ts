import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { DashboardRepository } from '../infrastructure/repository/dashboard.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';
import { Situation } from 'src/infrastructure/api/types/bilan';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private quizzRepository: QuizzRepository,
    private dashboardRepository: DashboardRepository,
    private bilanRepository: BilanRepository,
  ) {}

  async doIt(usernameOrId: string): Promise<Object> {
    let utilisateur =
      await this.utilisateurRepository.findFirstUtilisateursByName(
        usernameOrId,
      );

    const simulation = `{
      'transport . voiture . propriétaire': "'false'",
      'transport . voiture . gabarit': "'SUV'",
      'transport . voiture . motorisation': "'thermique'",
      'alimentation . boisson . chaude . café . nombre': 41,
      'transport . voiture . thermique . carburant': "'essence E85'",
    }`;

    if (utilisateur == null) {
      utilisateur = await this.utilisateurRepository.findUtilisateurById(
        usernameOrId,
      );
    }
    if (utilisateur == null) {
      throw new NotFoundException(
        `Pas d'utilisateur de nom ou d'id ${usernameOrId}`,
      );
    }

    const dashboard = await this.dashboardRepository.getByUtilisateurId(
      utilisateur.id,
    );

    const quizzList = await this.quizzRepository.getByListOfIds(
      dashboard.todoQuizz,
    );

    return {
      user: {
        id: utilisateur.id,
        name: utilisateur.name,
      },
      compteurs: dashboard ? dashboard['compteurs'] : [],
      quizz: quizzList,
      badges: dashboard ? dashboard['badges'] : [],
      bilan: await this.bilanRepository.evaluateSituation(simulation),
    };
  }
}
