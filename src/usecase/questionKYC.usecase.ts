import { Injectable } from '@nestjs/common';
import { QuestionKYC } from '../domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class QuestionKYCUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    return utilisateur.kyc.getAllQuestionSet();
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    return utilisateur.kyc.getQuestionOrException(questionId);
  }

  async updateResponse(
    utilisateurId: string,
    questionId: string,
    reponse: string[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    utilisateur.kyc.checkQuestionExists(questionId);

    this.updateUserTodo(utilisateur, questionId);

    if (!utilisateur.kyc.isQuestionAnswered(questionId)) {
      const question = utilisateur.kyc.getQuestionOrException(questionId);
      utilisateur.gamification.ajoutePoints(question.points);
    }
    utilisateur.kyc.updateQuestion(questionId, reponse);

    utilisateur.recomputeRecoTags();

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private updateUserTodo(utilisateur: Utilisateur, questionId: string) {
    const matching =
      utilisateur.parcours_todo.findTodoKYCElementByQuestionID(questionId);
    if (matching && !matching.element.isDone()) {
      matching.todo.makeProgress(matching.element);
    }
  }
}
