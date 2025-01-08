import { Injectable } from '@nestjs/common';

import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Scope } from '../domain/utilisateur/utilisateur';
import { KYCID } from '../domain/kyc/KYCID';

@Injectable()
export class AdminUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  async selectUserAvecVoiture(): Promise<any> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    const result = [];

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, [
        Scope.kyc,
      ]);

      const reponses = {
        id: utilisateur.id,
        email: utilisateur.email,
        trajet_ma_voiture: false,
        thermique: false,
        elec: false,
        trajet_court_voit: false,
        km: 0,
        motorisation: '',
        proprio: false,
        changer_voiture: false,
      };

      const kyc_009 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC009,
      );
      const kyc_011 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC011,
      );
      const kyc_012 = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC012,
      );
      const KYC_transport_voiture_km =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_voiture_km,
        );
      const KYC_transport_voiture_motorisation =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_voiture_motorisation,
        );

      const KYC_transport_type_utilisateur =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_transport_type_utilisateur,
        );
      const KYC_changer_voiture =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          KYCID.KYC_changer_voiture,
        );

      //################################

      reponses.trajet_ma_voiture =
        kyc_009?.getCodeReponseQuestionChoixUnique() === 'ma_voit';
      reponses.thermique =
        kyc_011?.getCodeReponseQuestionChoixUnique() === 'voit_therm';
      reponses.elec =
        kyc_011?.getCodeReponseQuestionChoixUnique() === 'voit_elec_hybride';
      reponses.trajet_court_voit =
        kyc_012?.getCodeReponseQuestionChoixUnique() === 'oui';
      reponses.km = KYC_transport_voiture_km?.getReponseSimpleValueAsNumber()
        ? KYC_transport_voiture_km.getReponseSimpleValueAsNumber()
        : 0;
      reponses.motorisation =
        KYC_transport_voiture_motorisation?.getCodeReponseQuestionChoixUnique();
      reponses.proprio =
        KYC_transport_type_utilisateur?.getCodeReponseQuestionChoixUnique() ===
        'proprio';
      reponses.changer_voiture =
        KYC_changer_voiture?.hasAnyResponses() &&
        KYC_changer_voiture?.getCodeReponseQuestionChoixUnique() !== 'non';

      if (
        reponses.trajet_ma_voiture ||
        reponses.thermique ||
        reponses.elec ||
        reponses.trajet_court_voit ||
        reponses.km > 0 ||
        (reponses.motorisation !== null &&
          reponses.motorisation !== undefined) ||
        reponses.proprio ||
        reponses.changer_voiture
      ) {
        if (!reponses.motorisation) {
          reponses.motorisation = null;
        }
        reponses.changer_voiture = !!reponses.changer_voiture;
        result.push(reponses);
      }
    }

    return result;
  }
}
