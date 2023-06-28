import { Injectable, NotFoundException } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { DashboardRepository } from '../infrastructure/repository/dashboard.repository';
import { BilanRepository } from '../infrastructure/repository/bilan.repository';

@Injectable()
export class GenerateDashboardUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private quizzRepository: QuizzRepository,
    private dashboardRepository: DashboardRepository,
    private bilanRepository: BilanRepository,
  ) {}

  async doIt(utilisateurId: string): Promise<Object> {

    let utilisateur = await this.utilisateurRepository.findUtilisateurById(utilisateurId);

    if (utilisateur == null) {
      throw new NotFoundException(
        `Pas d'utilisateur d'id ${utilisateurId}`,
      );
    }

    const dashboard = await this.dashboardRepository.getByUtilisateurId(
      utilisateur.id,
    );

    const quizzList = await this.quizzRepository.getByListOfIds(
      dashboard?.todoQuizz,
    );

    const bilan =
      (await this.bilanRepository.getBilanByUtilisateurId(utilisateur.id)) /
      1000;

    return {
      user: {
        id: utilisateur.id,
        name: utilisateur.name,
      },
      compteurs: dashboard ? dashboard['compteurs'] : [],
      quizz: quizzList,
      badges: dashboard ? dashboard['badges'] : [],
      bilan,
    };
  }
}
