import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../logement/logement';
import { Utilisateur } from '../../utilisateur/utilisateur';
import { KYCID } from '../KYCID';
import { QuestionChoixMultiple } from '../new_interfaces/QuestionChoixMultiples';
import { QuestionChoixUnique } from '../new_interfaces/QuestionChoixUnique';
import { QuestionNumerique } from '../new_interfaces/QuestionNumerique';
import { QuestionSimple } from '../new_interfaces/QuestionSimple';
import { QuestionTexteLibre } from '../new_interfaces/QuestionTexteLibre';
import { QuestionKYC } from '../questionKYC';

export class KycToProfileSync {
  public static synchronize(
    question:
      | QuestionKYC
      | QuestionChoixMultiple
      | QuestionChoixUnique
      | QuestionNumerique
      | QuestionTexteLibre
      | QuestionSimple,
    utilisateur: Utilisateur,
  ) {
    const kyc = question.getKyc();

    switch (kyc.code) {
      case KYCID.KYC006:
        utilisateur.logement.plus_de_15_ans = kyc.isSelected('plus_15');
        break;
      case KYCID.KYC_logement_age:
        const value = kyc.getReponseSimpleValueAsNumber();
        if (value) {
          utilisateur.logement.plus_de_15_ans = value >= 15;
        }
        break;
      case KYCID.KYC_DPE:
        const code_dpe = kyc.getSelected();
        utilisateur.logement.dpe = DPE[code_dpe];
        break;
      // FIXME: Why we want to loose precision here?
      case KYCID.KYC_superficie:
        const valeur = kyc.getReponseSimpleValueAsNumber();
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
        const code_prop = kyc.getSelected();
        utilisateur.logement.proprietaire = code_prop === 'oui';
        break;
      case KYCID.KYC_chauffage:
        const code_chauff = kyc.getSelected();
        utilisateur.logement.chauffage = Chauffage[code_chauff];
        break;
      case KYCID.KYC_type_logement:
        const code_log = kyc.getSelected();
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
