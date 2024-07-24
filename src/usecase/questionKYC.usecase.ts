import { Injectable } from '@nestjs/common';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycRepository: KycRepository,
    private defiRepository: DefiRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const result = utilisateur.kyc_history.getAllUpToDateQuestionSet();
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
  }

  async getQuestion(utilisateurId: string, questionId): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const result =
      utilisateur.kyc_history.getUpToDateQuestionOrException(questionId);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur);
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

    utilisateur.kyc_history.checkQuestionExists(questionId);
    this.updateUserTodo(utilisateur, questionId);

    if (!utilisateur.kyc_history.isQuestionAnswered(questionId)) {
      const question =
        utilisateur.kyc_history.getUpToDateQuestionOrException(questionId);
      utilisateur.gamification.ajoutePoints(question.points, utilisateur);
    }
    utilisateur.kyc_history.updateQuestion(questionId, reponse);

    if (questionId === KYCID.KYC006) {
      const kyc = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC006,
      );
      utilisateur.logement.plus_de_15_ans = kyc.includesReponseCode('plus_15');
    }

    utilisateur.missions.answerKyc(questionId, utilisateur);

    utilisateur.recomputeRecoTags();

    const catalogue_defis = await this.defiRepository.list({});
    utilisateur.missions.recomputeRecoDefi(utilisateur, catalogue_defis);

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
