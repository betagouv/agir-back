import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../logement/logement';
import { Utilisateur } from '../../utilisateur/utilisateur';
import { KYCID } from '../KYCID';
import { QuestionChoix } from '../new_interfaces/QuestionChoix';
import { QuestionNumerique } from '../new_interfaces/QuestionNumerique';
import { QuestionKYC } from '../questionKYC';

export class KycToProfileSync {
  public static synchronize(question: QuestionKYC, utilisateur: Utilisateur) {
    const kyc = question.getKyc();

    switch (kyc.code) {
      case KYCID.KYC006:
        utilisateur.logement.plus_de_15_ans = new QuestionChoix(kyc).isSelected(
          'plus_15',
        );
        break;
      case KYCID.KYC_logement_age:
        const value = new QuestionNumerique(kyc).getValue();
        if (value) {
          utilisateur.logement.plus_de_15_ans = value >= 15;
        }
        break;
      case KYCID.KYC_DPE:
        const code_dpe = kyc.getSelectedCode();
        utilisateur.logement.dpe = DPE[code_dpe];
        break;
      // FIXME: Why we want to loose precision here?
      case KYCID.KYC_superficie:
        const valeur = new QuestionNumerique(kyc).getValue();
        // FIXME: Was it intentional to match 30 to superficie_150?
        if (valeur < 35) {
          utilisateur.logement.superficie = Superficie.superficie_35;
        } else if (valeur < 70) {
          utilisateur.logement.superficie = Superficie.superficie_70;
        } else if (valeur < 100) {
          utilisateur.logement.superficie = Superficie.superficie_100;
        } else if (valeur < 150) {
          utilisateur.logement.superficie = Superficie.superficie_150;
        } else if (valeur >= 150)
          utilisateur.logement.superficie = Superficie.superficie_150_et_plus;
        break;
      case KYCID.KYC_proprietaire:
        const code_prop = kyc.getSelectedCode();
        utilisateur.logement.proprietaire = code_prop === 'oui';
        break;
      case KYCID.KYC_chauffage:
        const code_chauff = kyc.getSelectedCode();
        utilisateur.logement.chauffage = Chauffage[code_chauff];
        break;
      case KYCID.KYC_type_logement:
        const code_log = kyc.getSelectedCode();
        utilisateur.logement.type =
          code_log === 'type_appartement'
            ? TypeLogement.appartement
            : TypeLogement.maison;
        break;
      // FIXME: Is this the mapping we want ?
      case KYCID.KYC_menage:
        // const nombre = kyc.getReponseSimpleValueAsNumber();
        // if (nombre) {
        //   utilisateur.logement.nombre_adultes = nombre;
        //   utilisateur.logement.nombre_enfants = 0;
        // }
        break;
      default:
        break;
    }
  }
}
