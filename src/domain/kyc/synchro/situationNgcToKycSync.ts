import validator from 'validator';
import { Utilisateur } from '../../utilisateur/utilisateur';
import { KYCID } from '../KYCID';
import { QuestionChoixUnique } from '../new_interfaces/QuestionChoixUnique';
import { QuestionSimple } from '../new_interfaces/QuestionSimple';
import { TypeReponseQuestionKYC } from '../QuestionKYCData';
import { KycToProfileSync } from './kycToProfileSync';

export class SituationNgcToKycSync {
  public static synchronize(
    situation: object,
    utilisateur: Utilisateur,
  ): string[] {
    const history = utilisateur.kyc_history;
    const result = [];
    for (const [key, value] of Object.entries(situation)) {
      const kyc_ngc = history.getQuestionByNGCKey(key);

      if (!kyc_ngc) {
        console.log(`KYC NGC manquant dans agir [${key}]`);
      } else {
        if (kyc_ngc.is_NGC && !kyc_ngc.is_answered) {
          const string_value = '' + value;

          const is_kyc_number =
            kyc_ngc.type === TypeReponseQuestionKYC.entier ||
            kyc_ngc.type === TypeReponseQuestionKYC.decimal;

          if (validator.isInt(string_value) && is_kyc_number) {
            const number_kyc = new QuestionSimple(kyc_ngc);
            number_kyc.setStringValue(string_value);
            history.updateQuestion(number_kyc);
            result.push(key);
            KycToProfileSync.synchronize(kyc_ngc, utilisateur);
          } else if (validator.isDecimal(string_value) && is_kyc_number) {
            const number_kyc = new QuestionSimple(kyc_ngc);
            number_kyc.setStringValue(string_value);
            history.updateQuestion(number_kyc);
            result.push(key);
            KycToProfileSync.synchronize(kyc_ngc, utilisateur);
          } else if (kyc_ngc.type === TypeReponseQuestionKYC.choix_unique) {
            const choix_unique_kyc = new QuestionChoixUnique(kyc_ngc);
            const value =
              // TODO: to remove when NGC has deployed the new version (3.8.1)
              kyc_ngc.code === KYCID.KYC_transport_voiture_motorisation &&
              string_value === 'hybride'
                ? 'hybride non rechargeable'
                : string_value;
            const ok = choix_unique_kyc.selectByCodeNgc(value);
            history.updateQuestion(choix_unique_kyc);
            if (ok) {
              result.push(key);
              KycToProfileSync.synchronize(kyc_ngc, utilisateur);
            } else {
              console.error(
                `Code NGC [${value}] non disponible pour la KYC ${kyc_ngc.id_cms}/${kyc_ngc.code}`,
              );
            }
          }
        } else {
          console.log(
            `KYC NGC trouvée dans agir [${key}] mais non flaguée NGC !`,
          );
        }
      }
    }
    return result;
  }
}
