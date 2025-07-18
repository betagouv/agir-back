import { KYCHistory } from '../kycHistory';
import { KYCID } from '../KYCID';
import { BooleanKYC } from '../QuestionKYCData';

export class KycToKycSynch {
  public static synchro(history: KYCHistory) {
    const kyc_transport_type_utilisateur = history.getQuestionChoixUnique(
      KYCID.KYC_transport_type_utilisateur,
    );
    const kyc_possede_voiture_oui_non = history.getQuestionChoixUnique(
      KYCID.KYC_possede_voiture_oui_non,
    );

    if (!kyc_possede_voiture_oui_non || !kyc_transport_type_utilisateur) {
      return;
    }

    if (!kyc_possede_voiture_oui_non.isAnswered()) {
      if (kyc_transport_type_utilisateur.isSelected('proprio')) {
        kyc_possede_voiture_oui_non.selectByCode(BooleanKYC.oui);
        history.updateQuestion(kyc_possede_voiture_oui_non);
      }
      if (
        kyc_transport_type_utilisateur.isSelected('change_souvent') ||
        kyc_transport_type_utilisateur.isSelected('jamais')
      ) {
        kyc_possede_voiture_oui_non.selectByCode(BooleanKYC.non);
        history.updateQuestion(kyc_possede_voiture_oui_non);
      }
    }
  }
}
