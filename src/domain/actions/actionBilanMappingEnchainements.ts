import { EnchainementType } from '../kyc/enchainementDefinition';
import { ActionBilanID } from './typeAction';

export const ACTION_BILAN_MAPPING_ENCHAINEMENTS: {
  [id in ActionBilanID]: EnchainementType;
} = {
  [ActionBilanID.action_bilan_alimentation]:
    EnchainementType.ENCHAINEMENT_KYC_bilan_alimentation,
  [ActionBilanID.action_bilan_conso]:
    EnchainementType.ENCHAINEMENT_KYC_bilan_consommation,
  [ActionBilanID.action_bilan_logement]:
    EnchainementType.ENCHAINEMENT_KYC_bilan_logement,
  [ActionBilanID.action_bilan_transports]:
    EnchainementType.ENCHAINEMENT_KYC_bilan_transport,
};
