import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../logement/logement';
import { KYCHistory } from '../kycHistory';
import { KYCID } from '../KYCID';

type LogementInput = {
  nombre_adultes?: number;
  nombre_enfants?: number;
  code_postal?: string;
  commune?: string;
  type?: TypeLogement;
  superficie?: Superficie;
  proprietaire?: boolean;
  chauffage?: Chauffage;
  plus_de_15_ans?: boolean;
  dpe?: DPE;
};

export class LogementToKycSync {
  public static synchronize(input: LogementInput, history: KYCHistory) {
    if (input.dpe && history.doesQuestionExistsByCode(KYCID.KYC_DPE)) {
      const choix_unique = history.getQuestionChoixUnique(KYCID.KYC_DPE);
      choix_unique.selectByCode(input.dpe);
      history.updateQuestion(choix_unique);
    }
    if (
      input.superficie &&
      history.doesQuestionExistsByCode(KYCID.KYC_superficie)
    ) {
      const value: Record<Superficie, number> = {
        superficie_35: 34,
        superficie_70: 69,
        superficie_100: 99,
        superficie_150: 149,
        superficie_150_et_plus: 200,
      };

      const kyc = history.getQuestionNumerique(KYCID.KYC_superficie);
      kyc.setValue(value[input.superficie]);
      history.updateQuestion(kyc);
    }
    if (
      input.proprietaire !== undefined &&
      input.proprietaire !== null &&
      history.doesQuestionExistsByCode(KYCID.KYC_proprietaire)
    ) {
      const choix_unique = history.getQuestionChoixUnique(
        KYCID.KYC_proprietaire,
      );
      choix_unique.selectByCode(input.proprietaire ? 'oui' : 'non');
      history.updateQuestion(choix_unique);
    }
    if (input.chauffage) {
      const target_KYC: Record<Chauffage, KYCID> = {
        gaz: KYCID.KYC_chauffage_gaz,
        fioul: KYCID.KYC_chauffage_fioul,
        electricite: KYCID.KYC_chauffage_elec,
        bois: KYCID.KYC_chauffage_bois,
        autre: null,
      };

      if (history.doesQuestionExistsByCode(KYCID.KYC_chauffage_gaz)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC_chauffage_gaz);
        kyc.selectByCode('ne_sais_pas');
        history.updateQuestion(kyc);
      }
      if (history.doesQuestionExistsByCode(KYCID.KYC_chauffage_fioul)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC_chauffage_fioul);
        kyc.selectByCode('ne_sais_pas');
        history.updateQuestion(kyc);
      }
      if (history.doesQuestionExistsByCode(KYCID.KYC_chauffage_bois)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC_chauffage_bois);
        kyc.selectByCode('ne_sais_pas');
        history.updateQuestion(kyc);
      }
      if (history.doesQuestionExistsByCode(KYCID.KYC_chauffage_elec)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC_chauffage_elec);
        kyc.selectByCode('ne_sais_pas');
        history.updateQuestion(kyc);
      }
      if (input.chauffage !== Chauffage.autre) {
        if (history.doesQuestionExistsByCode(target_KYC[input.chauffage])) {
          const kyc = history.getQuestionChoixUnique(
            target_KYC[input.chauffage],
          );
          kyc.selectByCode('oui');
          history.updateQuestion(kyc);
        }
      }
    }

    if (input.nombre_adultes || input.nombre_enfants) {
      if (history.doesQuestionExistsByCode(KYCID.KYC_menage)) {
        const kyc = history.getQuestionNumerique(KYCID.KYC_menage);
        kyc.setValue(
          (input.nombre_adultes ? input.nombre_adultes : 0) +
            (input.nombre_enfants ? input.nombre_enfants : 0),
        );
        history.updateQuestion(kyc);
      }
    }
    if (input.type) {
      if (history.doesQuestionExistsByCode(KYCID.KYC_type_logement)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC_type_logement);
        kyc.selectByCode(
          input.type === TypeLogement.appartement
            ? 'type_appartement'
            : 'type_maison',
        );
        history.updateQuestion(kyc);
      }
    }
    if (input.plus_de_15_ans !== undefined && input.plus_de_15_ans !== null) {
      if (history.doesQuestionExistsByCode(KYCID.KYC006)) {
        const kyc = history.getQuestionChoixUnique(KYCID.KYC006);
        kyc.selectByCode(input.plus_de_15_ans ? 'plus_15' : 'moins_15');
        history.updateQuestion(kyc);
      }
      if (history.doesQuestionExistsByCode(KYCID.KYC_logement_age)) {
        const kyc = history.getQuestionNumerique(KYCID.KYC_logement_age);
        kyc.setValue(input.plus_de_15_ans ? 20 : 5);
        history.updateQuestion(kyc);
      }
    }
  }
}
