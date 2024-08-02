import { Injectable } from '@nestjs/common';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneStatistiqueRepository } from '../infrastructure/repository/bilanCarboneStatistique.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import { BilanCarbone } from '../domain/bilan/bilanCarbone';

@Injectable()
export class BilanCarboneUsecase {
  constructor(
    private nGCCalculator: NGCCalculator,
    private utilisateurRepository: UtilisateurRepository,
    private bilanCarboneStatistiqueRepository: BilanCarboneStatistiqueRepository,
  ) {}

  async getCurrentBilanByUtilisateurId(
    utilisateurId: string,
  ): Promise<BilanCarbone> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const situation = this.computeSituation(utilisateur);

    const result =
      this.nGCCalculator.computeBilanCarboneFromSituation(situation);

    return result;
  }

  async computeBilanTousUtilisateurs(): Promise<string[]> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id);

      const situation = this.computeSituation(utilisateur);

      const bilan = this.nGCCalculator.computeBilanFromSituation(situation);

      await this.bilanCarboneStatistiqueRepository.upsertStatistiques(
        user_id,
        situation,
        bilan.bilan_carbone_annuel * 1000,
        bilan.details.transport * 1000,
        bilan.details.alimentation * 1000,
      );
    }
    return user_id_liste;
  }

  public computeSituation(utilisateur: Utilisateur): Object {
    const situation = {};

    for (const kyc of utilisateur.kyc_history.answered_questions) {
      if (kyc.is_NGC) {
        if (kyc.ngc_key) {
          situation[kyc.ngc_key] = kyc.reponses[0].ngc_code;
        } else {
          console.log(`Missing ngc key for KYC [${kyc.id_cms}/${kyc.id}]`);
        }
      }
    }

    return situation;
  }
}
