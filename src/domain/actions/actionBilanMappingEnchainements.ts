import { Enchainement } from '../../usecase/questionKYC.usecase';
import { ActionBilanID } from './typeAction';

export const ACTION_BILAN_MAPPING_ENCHAINEMENTS: {
  [id in ActionBilanID]: Enchainement;
} = {
  [ActionBilanID.action_bilan_alimentation]:
    Enchainement.ENCHAINEMENT_KYC_personnalisation_alimentation,
  [ActionBilanID.action_bilan_conso]:
    Enchainement.ENCHAINEMENT_KYC_personnalisation_consommation,
  [ActionBilanID.action_bilan_logement]:
    Enchainement.ENCHAINEMENT_KYC_personnalisation_logement,
  [ActionBilanID.action_bilan_transports]:
    Enchainement.ENCHAINEMENT_KYC_personnalisation_transport,
};
