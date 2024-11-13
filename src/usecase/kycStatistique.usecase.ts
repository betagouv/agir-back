import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KycStatistiqueRepository } from '../../src/infrastructure/repository/kycStatistique.repository';
import { KYCReponse } from 'src/domain/kyc/questionKYC';
import { Scope } from '../domain/utilisateur/utilisateur';

@Injectable()
export class KycStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycStatistiqueRepository: KycStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
        [Scope.kyc],
      );

      for (const question of utilisateur.kyc_history.answered_questions) {
        await this.kycStatistiqueRepository.upsertStatistiquesDUneKyc(
          utilisateurId,
          question.code,
          question.question,
          this.ordonneReponse(question.getListeReponsesComplexes()),
        );
      }
    }
    return [];
  }

  private ordonneReponse(reponses: KYCReponse[]): string {
    return reponses
      .map((reponse) => reponse.label)
      .sort()
      .join(', ');
  }
}
