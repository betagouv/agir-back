import { Injectable } from '@nestjs/common';
import { QuizzQuestion } from '@prisma/client';
import { BodyReponsesQuizz } from 'src/infrastructure/api/types/reponsesQuizz';
import { QuizzRepository } from '../infrastructure/repository/quizz.repository';
import { DashboardRepository } from '../infrastructure/repository/dashboard.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';

@Injectable()
export class EvaluerQuizzUsecase {
  constructor(
    private quizzRepository: QuizzRepository,
    private dashboardRepository: DashboardRepository,
    private utilisateurRepository: UtilisateurRepository,
    private badgeRepository: BadgeRepository
    ) {}

  async doIt(bodyReponsesQuizz: BodyReponsesQuizz, quizzId:string): Promise<boolean> {
    let quizz = await this.quizzRepository.getById(quizzId);
    const success = this.checkQuizz(bodyReponsesQuizz, quizz["questions"]);
    const utilisateur = await this.utilisateurRepository.findUtilisateurById(bodyReponsesQuizz.utilisateur);

    if (success) {
      const dashboard = await this.dashboardRepository.getByUtilisateurId(utilisateur.id);
      dashboard.todoQuizz = dashboard.todoQuizz.filter(e => e !== quizzId);
      dashboard.doneQuizz.push(quizzId);
      await this.dashboardRepository.updateQuizzArrays(dashboard);

      await this.badgeRepository.createBadgeForDashboard("Ton premier quizz réussi !!", dashboard.id);
    }
    return success;
  }

  public findReponseForQuestionId(reponsesQuizz:BodyReponsesQuizz, id:string) {
    const found = reponsesQuizz.reponses.find(element => {
      return Object.keys(element)[0] === id;
    });
    return Object.values(found)[0]
  }
  public checkQuizz(bodyReponsesQuizz: BodyReponsesQuizz, questions:QuizzQuestion[]): boolean {
    let success = true;
    questions.forEach(element => {
      success = success && (element.solution == this.findReponseForQuestionId(bodyReponsesQuizz, element.id));
    })
    return success;
  }
}
