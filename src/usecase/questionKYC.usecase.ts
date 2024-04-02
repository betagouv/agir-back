import { Injectable } from '@nestjs/common';
import { QuestionID, QuestionKYC } from '../domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';

@Injectable()
export class QuestionKYCUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    return utilisateur.kyc_history.getAllQuestionSet();
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    // FIXME : until reset
    if (questionId === '001') {
      questionId = QuestionID.KYC001;
    }

    return utilisateur.kyc_history.getQuestionOrException(questionId);
  }

  async updateResponse(
    utilisateurId: string,
    questionId: string,
    reponse: string[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);

    // FIXME : until reset
    let qid = questionId;
    if (questionId === '001') {
      questionId = QuestionID.KYC001;
    }

    utilisateur.kyc_history.checkQuestionExists(questionId);

    this.updateUserTodo(utilisateur, qid);

    if (!utilisateur.kyc_history.isQuestionAnswered(questionId)) {
      const question =
        utilisateur.kyc_history.getQuestionOrException(questionId);
      utilisateur.gamification.ajoutePoints(question.points);
    }
    utilisateur.kyc_history.updateQuestion(questionId, reponse);

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
