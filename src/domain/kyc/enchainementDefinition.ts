import { KYCID } from './KYCID';
import { KYCMosaicID } from './mosaicDefinition';

export enum EnchainementID {
  ENCHAINEMENT_KYC_1 = 'ENCHAINEMENT_KYC_1',
  ENCHAINEMENT_KYC_action_simulateur_voiture = 'ENCHAINEMENT_KYC_action_simulateur_voiture',
  ENCHAINEMENT_KYC_actions_watt_watchers = 'ENCHAINEMENT_KYC_actions_watt_watchers',
  ENCHAINEMENT_KYC_bilan_alimentation = 'ENCHAINEMENT_KYC_bilan_alimentation',
  ENCHAINEMENT_KYC_bilan_consommation = 'ENCHAINEMENT_KYC_bilan_consommation',
  ENCHAINEMENT_KYC_bilan_logement = 'ENCHAINEMENT_KYC_bilan_logement',
  ENCHAINEMENT_KYC_bilan_transport = 'ENCHAINEMENT_KYC_bilan_transport',
  ENCHAINEMENT_KYC_mini_bilan_carbone = 'ENCHAINEMENT_KYC_mini_bilan_carbone',
  ENCHAINEMENT_KYC_personnalisation_alimentation = 'ENCHAINEMENT_KYC_personnalisation_alimentation',
  ENCHAINEMENT_KYC_personnalisation_consommation = 'ENCHAINEMENT_KYC_personnalisation_consommation',
  ENCHAINEMENT_KYC_personnalisation_logement = 'ENCHAINEMENT_KYC_personnalisation_logement',
  ENCHAINEMENT_KYC_personnalisation_transport = 'ENCHAINEMENT_KYC_personnalisation_transport',
}

export type GlobalKYCID = KYCID | KYCMosaicID;

export class KycDansEnchainement {
  id: GlobalKYCID;
  is_mandatory?: boolean;
}

const EnchainementDefinitionData: Record<
  EnchainementID,
  KycDansEnchainement[]
> = {
  ENCHAINEMENT_KYC_1: [
    { id: KYCID.KYC001 },
    { id: KYCMosaicID.TEST_MOSAIC_ID },
  ],
  ENCHAINEMENT_KYC_action_simulateur_voiture: [
    { id: KYCID.KYC_transport_type_utilisateur },
    { id: KYCID.KYC_transport_voiture_occasion },
    { id: KYCID.KYC_transport_voiture_km },
    { id: KYCID.KYC_transport_voiture_duree_detention },
    { id: KYCID.KYC_transport_voiture_annee_fabrication },
    { id: KYCID.KYC_transport_voiture_prix_achat },
    { id: KYCID.KYC_transport_voiture_gabarit },
    { id: KYCID.KYC_transport_voiture_motorisation },
    { id: KYCID.KYC_transport_voiture_thermique_carburant },
    { id: KYCID.KYC_transport_voiture_thermique_consomation_carburant },
    { id: KYCID.KYC_transport_voiture_thermique_prix_carburant },
    { id: KYCID.KYC_transport_voiture_electrique_consommation },
    { id: KYCID.KYC_transport_voiture_electrique_prix_kwh },
    { id: KYCID.KYC_transport_voiture_couts_entretien },
    { id: KYCID.KYC_transport_voiture_couts_assurance },
    { id: KYCID.KYC_transport_voiture_couts_stationnement },
    { id: KYCID.KYC_transport_voiture_couts_peage },
  ],
  ENCHAINEMENT_KYC_actions_watt_watchers: [
    { id: KYCID.KYC_type_logement, is_mandatory: true },
    { id: KYCID.KYC_proprietaire },
    { id: KYCID.KYC_superficie, is_mandatory: true },
    { id: KYCID.KYC_logement_age, is_mandatory: true },
    { id: KYCID.KYC_menage, is_mandatory: true },
    { id: KYCID.KYC_chauffage, is_mandatory: true },
    { id: KYCID.KYC_type_chauffage_eau, is_mandatory: true },
    { id: KYCID.KYC_chauffage_reseau },
    { id: KYCID.KYC_logement_reno_second_oeuvre },
    { id: KYCID.KYC_electro_refrigerateur },
  ],
  ENCHAINEMENT_KYC_bilan_alimentation: [
    { id: KYCID.KYC_alimentation_regime }, // manque quand import NGC Full
    { id: KYCID.KYC_petitdej },
    { id: KYCID.KYC_local_frequence },
    { id: KYCID.KYC_saison_frequence },
    { id: KYCID.KYC_alimentation_litres_alcool },
    { id: KYCID.KYC_gaspillage_alimentaire_frequence },
    { id: KYCMosaicID.MOSAIC_REDUCTION_DECHETS },
  ],
  ENCHAINEMENT_KYC_bilan_consommation: [
    { id: KYCID.KYC_consommation_type_consommateur }, // manque quand import NGC Full
    { id: KYCMosaicID.MOSAIC_LOGEMENT_VACANCES },
    { id: KYCID.KYC_consommation_relation_objets },
    { id: KYCMosaicID.MOSAIC_ELECTROMENAGER },
    { id: KYCMosaicID.MOSAIC_ANIMAUX },
    { id: KYCMosaicID.MOSAIC_APPAREIL_NUM },
    { id: KYCMosaicID.MOSAIC_MEUBLES },
    { id: KYCID.KYC_raison_achat_vetements },
  ],
  ENCHAINEMENT_KYC_bilan_logement: [
    { id: KYCID.KYC_type_logement },
    { id: KYCID.KYC_menage },
    { id: KYCID.KYC_superficie },
    { id: KYCID.KYC_logement_age },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE },
    { id: KYCID.KYC_temperature },
    // TODO: { id : KYCID.KYC_conso_elec},
    { id: KYCMosaicID.MOSAIC_RENO },
    { id: KYCID.KYC_photovoltaiques },
    { id: KYCMosaicID.MOSAIC_EXTERIEUR },
  ],
  ENCHAINEMENT_KYC_bilan_transport: [
    { id: KYCID.KYC_transport_avion_3_annees },
    { id: KYCID.KYC_transport_heures_avion_court },
    { id: KYCID.KYC_transport_heures_avion_moyen },
    { id: KYCID.KYC_transport_heures_avion_long },
    { id: KYCID.KYC_transport_type_utilisateur },
    { id: KYCID.KYC_transport_voiture_km },
    { id: KYCID.KYC_transport_voiture_nbr_voyageurs },
    { id: KYCID.KYC_transport_voiture_gabarit },
    { id: KYCID.KYC_transport_voiture_motorisation },
    { id: KYCID.KYC_transport_voiture_thermique_carburant },
    // NOTE: attendre que tous les fronts aient implémenté la possibilité
    // de passer les questions.
    // { id : KYCID.KYC_transport_voiture_electrique_consommation},
    // { id : KYCID.KYC_transport_voiture_thermique_consomation_carburant},
    { id: KYCID.KYC_transport_2roues_usager },
    { id: KYCID.KYC_2roue_motorisation_type },
    { id: KYCID.KYC_2roue_km },
  ],
  ENCHAINEMENT_KYC_mini_bilan_carbone: [
    { id: KYCID.KYC_transport_voiture_km },
    { id: KYCID.KYC_transport_avion_3_annees },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE },
    { id: KYCID.KYC_superficie },
    { id: KYCID.KYC_menage },
    { id: KYCID.KYC_alimentation_regime },
    { id: KYCID.KYC_consommation_type_consommateur },
  ],
  ENCHAINEMENT_KYC_personnalisation_alimentation: [
    { id: KYCID.KYC_alimentation_regime },
    { id: KYCID.KYC_saison_frequence },
    { id: KYCMosaicID.MOSAIC_REDUCTION_DECHETS },
    { id: KYCID.KYC_local_frequence },
  ],
  ENCHAINEMENT_KYC_personnalisation_consommation: [
    { id: KYCID.KYC_consommation_relation_objets },
    { id: KYCID.KYC_consommation_type_consommateur },
  ],
  ENCHAINEMENT_KYC_personnalisation_logement: [
    { id: KYCID.KYC_type_logement },
    { id: KYCID.KYC_proprietaire },
    { id: KYCID.KYC_jardin },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE },
    { id: KYCMosaicID.MOSAIC_RENO },
  ],
  ENCHAINEMENT_KYC_personnalisation_transport: [
    { id: KYCID.KYC_transport_avion_3_annees },
    { id: KYCID.KYC003 },
    { id: KYCID.KYC_possede_voiture_oui_non },
  ],
};

export class EnchainementDefinition {
  public static getKycCodesByEnchainementID(
    enchainement_id: EnchainementID,
  ): GlobalKYCID[] {
    const liste = EnchainementDefinitionData[enchainement_id];
    if (liste) {
      return liste.map((e) => e.id);
    } else {
      return [];
    }
  }

  public static isKycMandatoryInEnchainement(
    id: GlobalKYCID,
    enchainement_id: EnchainementID,
  ): boolean {
    const liste = EnchainementDefinitionData[enchainement_id];
    if (liste) {
      const kyc_def = liste.find((e) => e.id === id);
      if (kyc_def) {
        return !!kyc_def.is_mandatory;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public static set_definition_for_test_only(
    enchainement_id: EnchainementID,
    def: KycDansEnchainement[],
  ) {
    EnchainementDefinitionData[enchainement_id] = def;
  }
}
