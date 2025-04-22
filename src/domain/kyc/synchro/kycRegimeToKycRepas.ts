import { Utilisateur } from '../../utilisateur/utilisateur';
import { KYCID } from '../KYCID';
import { QuestionChoixUnique } from '../new_interfaces/QuestionChoixUnique';

export class KycRegimeToKycRepas {
  public static synchroAlimentationRegime(
    kyc_regime: QuestionChoixUnique,
    utilisateur: Utilisateur,
  ) {
    const code = kyc_regime.getSelectedCode();
    const hist = utilisateur.kyc_history;
    if (!code) return;

    const KYC_nbr_plats_vegetaliens = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_vegetaliens,
    );
    const KYC_nbr_plats_vegetariens = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_vegetariens,
    );
    const KYC_nbr_plats_poisson_blanc = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_poisson_blanc,
    );
    const KYC_nbr_plats_poisson_gras = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_poisson_gras,
    );
    const KYC_nbr_plats_viande_blanche = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_viande_blanche,
    );
    const KYC_nbr_plats_viande_rouge = hist.getQuestionNumerique(
      KYCID.KYC_nbr_plats_viande_rouge,
    );

    if (code === 'vegetalien') {
      KYC_nbr_plats_vegetaliens.setValue(14);
      KYC_nbr_plats_vegetariens.setValue(0);
      KYC_nbr_plats_poisson_blanc.setValue(0);
      KYC_nbr_plats_poisson_gras.setValue(0);
      KYC_nbr_plats_viande_blanche.setValue(0);
      KYC_nbr_plats_viande_rouge.setValue(0);
    }
    if (code === 'vegetarien') {
      KYC_nbr_plats_vegetaliens.setValue(3);
      KYC_nbr_plats_vegetariens.setValue(11);
      KYC_nbr_plats_poisson_blanc.setValue(0);
      KYC_nbr_plats_poisson_gras.setValue(0);
      KYC_nbr_plats_viande_blanche.setValue(0);
      KYC_nbr_plats_viande_rouge.setValue(0);
    }
    if (code === 'peu_viande') {
      KYC_nbr_plats_vegetaliens.setValue(1);
      KYC_nbr_plats_vegetariens.setValue(7);
      KYC_nbr_plats_poisson_blanc.setValue(1);
      KYC_nbr_plats_poisson_gras.setValue(1);
      KYC_nbr_plats_viande_blanche.setValue(4);
      KYC_nbr_plats_viande_rouge.setValue(0);
    }
    if (code === 'chaque_jour_viande') {
      KYC_nbr_plats_vegetaliens.setValue(0);
      KYC_nbr_plats_vegetariens.setValue(1);
      KYC_nbr_plats_poisson_blanc.setValue(1);
      KYC_nbr_plats_poisson_gras.setValue(1);
      KYC_nbr_plats_viande_blanche.setValue(6);
      KYC_nbr_plats_viande_rouge.setValue(6);
    }
    hist.updateQuestion(KYC_nbr_plats_vegetaliens);
    hist.updateQuestion(KYC_nbr_plats_vegetariens);
    hist.updateQuestion(KYC_nbr_plats_poisson_blanc);
    hist.updateQuestion(KYC_nbr_plats_poisson_gras);
    hist.updateQuestion(KYC_nbr_plats_viande_blanche);
    hist.updateQuestion(KYC_nbr_plats_viande_rouge);
  }
}
