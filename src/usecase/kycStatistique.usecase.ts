import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KycStatistiqueRepository } from '../../src/infrastructure/repository/kycStatistique.repository';
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
        console.log(question);
        const label_reponse = question.getSelectedLabels();
        await this.kycStatistiqueRepository.upsertStatistiquesDUneKyc(
          utilisateurId,
          question.code,
          question.question,
          label_reponse.sort().join(', '),
        );
      }
    }
    return [];
  }
}
