import { EnchainementID } from '../kyc/enchainementDefinition';
import { ActionBilanID, ActionSimulateurID } from './typeAction';

export const ACTION_BILAN_MAPPING_ENCHAINEMENTS: {
  [id in ActionBilanID]: EnchainementID;
} = {
  [ActionBilanID.action_bilan_alimentation]:
    EnchainementID.ENCHAINEMENT_KYC_bilan_alimentation,
  [ActionBilanID.action_bilan_conso]:
    EnchainementID.ENCHAINEMENT_KYC_bilan_consommation,
  [ActionBilanID.action_bilan_logement]:
    EnchainementID.ENCHAINEMENT_KYC_bilan_logement,
  [ActionBilanID.action_bilan_transports]:
    EnchainementID.ENCHAINEMENT_KYC_bilan_transport,
};

export const ACTION_SIMULATEUR_MAPPING_ENCHAINEMENTS: {
  [id in ActionSimulateurID]: EnchainementID | undefined;
} = {
  action_simulateur_maif: undefined,
  action_simulateur_voiture:
    EnchainementID.ENCHAINEMENT_KYC_action_simulateur_voiture,
  actions_watt_watchers: EnchainementID.ENCHAINEMENT_KYC_actions_watt_watchers,
  simu_aides_reno: undefined,
};
