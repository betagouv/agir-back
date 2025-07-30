import { EnchainementType } from '../kyc/enchainementDefinition';
import { ActionBilanID, ActionSimulateurID } from './typeAction';

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

export const ACTION_SIMULATEUR_MAPPING_ENCHAINEMENTS: {
  [id in ActionSimulateurID]: EnchainementType | undefined;
} = {
  action_simulateur_maif: undefined,
  action_simulateur_voiture:
    EnchainementType.ENCHAINEMENT_KYC_action_simulateur_voiture,
  actions_watt_watchers:
    EnchainementType.ENCHAINEMENT_KYC_actions_watt_watchers,
  simu_aides_reno: undefined,
};
