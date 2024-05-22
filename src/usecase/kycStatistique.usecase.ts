import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KycStatistiqueRepository } from '../../src/infrastructure/repository/kycStatistique.repository';
import { KYCReponse } from 'src/domain/kyc/questionQYC';

@Injectable()
export class KycStatistiqueUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycStatistiqueRepository: KycStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user_id = listeUtilisateursIds[index];

      const utilisateur = await this.utilisateurRepository.getById(user_id);

      for (
        let index = 0;
        index < utilisateur.kyc_history.answered_questions.length;
        index++
      ) {
        await this.kycStatistiqueRepository.upsertStatistiquesDUneKyc(
          user_id,
          utilisateur.kyc_history.answered_questions[index].id,
          utilisateur.kyc_history.answered_questions[index].question,
          this.ordonneReponse(
            utilisateur.kyc_history.answered_questions[index].reponses,
          ),
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
