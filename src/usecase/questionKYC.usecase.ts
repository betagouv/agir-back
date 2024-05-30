import { Injectable } from '@nestjs/common';
import { KYCID, QuestionKYC } from '../domain/kyc/questionQYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycRepository: KycRepository,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    return utilisateur.kyc_history.getAllQuestionSet();
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    return utilisateur.kyc_history.getQuestionOrException(questionId);
  }

  async updateResponse(
    utilisateurId: string,
    questionId: string,
    reponse: string[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    if (questionId === KYCID.KYC006) {
      utilisateur.logement.plus_de_15_ans = reponse.includes('plus_15');
    }

    utilisateur.kyc_history.checkQuestionExists(questionId);
    this.updateUserTodo(utilisateur, questionId);

    if (!utilisateur.kyc_history.isQuestionAnswered(questionId)) {
      const question =
        utilisateur.kyc_history.getQuestionOrException(questionId);
      utilisateur.gamification.ajoutePoints(question.points);
    }
    utilisateur.kyc_history.updateQuestion(questionId, reponse);

    utilisateur.missions.answerKyc(questionId, utilisateur);

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
