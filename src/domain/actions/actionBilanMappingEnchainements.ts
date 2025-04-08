import { Enchainement } from '../../usecase/questionKYCEnchainement.usecase';
import { ActionBilanID } from './typeAction';

export const ACTION_BILAN_MAPPING_ENCHAINEMENTS: {
  [id in ActionBilanID]: Enchainement;
} = {
  [ActionBilanID.action_bilan_alimentation]:
    Enchainement.ENCHAINEMENT_KYC_bilan_alimentation,
  [ActionBilanID.action_bilan_conso]:
    Enchainement.ENCHAINEMENT_KYC_bilan_consommation,
  [ActionBilanID.action_bilan_logement]:
    Enchainement.ENCHAINEMENT_KYC_bilan_logement,
  [ActionBilanID.action_bilan_transports]:
    Enchainement.ENCHAINEMENT_KYC_bilan_transport,
};
