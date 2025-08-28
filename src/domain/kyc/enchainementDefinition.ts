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
  is_mandatory: boolean;
}

const EnchainementDefinitionData: Record<
  EnchainementID,
  KycDansEnchainement[]
> = {
  ENCHAINEMENT_KYC_1: [
    { id: KYCID.KYC001, is_mandatory: false },
    { id: KYCMosaicID.TEST_MOSAIC_ID, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_action_simulateur_voiture: [
    { id: KYCID.KYC_transport_type_utilisateur, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_occasion, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_km, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_duree_detention, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_annee_fabrication, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_prix_achat, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_gabarit, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_motorisation, is_mandatory: false },
    {
      id: KYCID.KYC_transport_voiture_thermique_carburant,
      is_mandatory: false,
    },
    {
      id: KYCID.KYC_transport_voiture_thermique_consomation_carburant,
      is_mandatory: false,
    },
    {
      id: KYCID.KYC_transport_voiture_thermique_prix_carburant,
      is_mandatory: false,
    },
    {
      id: KYCID.KYC_transport_voiture_electrique_consommation,
      is_mandatory: false,
    },
    {
      id: KYCID.KYC_transport_voiture_electrique_prix_kwh,
      is_mandatory: false,
    },
    { id: KYCID.KYC_transport_voiture_couts_entretien, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_couts_assurance, is_mandatory: false },
    {
      id: KYCID.KYC_transport_voiture_couts_stationnement,
      is_mandatory: false,
    },
    { id: KYCID.KYC_transport_voiture_couts_peage, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_actions_watt_watchers: [
    { id: KYCID.KYC_type_logement, is_mandatory: true },
    { id: KYCID.KYC_proprietaire, is_mandatory: false },
    { id: KYCID.KYC_superficie, is_mandatory: true },
    { id: KYCID.KYC_logement_age, is_mandatory: true },
    { id: KYCID.KYC_menage, is_mandatory: true },
    { id: KYCID.KYC_chauffage, is_mandatory: true },
    { id: KYCID.KYC_type_chauffage_eau, is_mandatory: true },
    { id: KYCID.KYC_chauffage_reseau, is_mandatory: false },
    { id: KYCID.KYC_logement_reno_second_oeuvre, is_mandatory: false },
    { id: KYCID.KYC_electro_petit_refrigerateur, is_mandatory: false },
    { id: KYCID.KYC_electro_refrigerateur, is_mandatory: false },
    { id: KYCID.KYC_logement_frigo_americain, is_mandatory: false },
    { id: KYCID.KYC_electro_congelateur, is_mandatory: false },
    { id: KYCID.KYC_loisir_piscine_type, is_mandatory: false },
    { id: KYCID.KYC_electro_cave_a_vin, is_mandatory: false },
    { id: KYCID.KYC_appareil_television, is_mandatory: false },
    { id: KYCID.KYC_appareil_console_salon, is_mandatory: false },
    { id: KYCID.KYC_appareil_box_internet, is_mandatory: false },
    { id: KYCID.KYC_electro_plaques, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_bilan_alimentation: [
    { id: KYCID.KYC_alimentation_regime, is_mandatory: false }, // manque quand import NGC Full
    { id: KYCID.KYC_petitdej, is_mandatory: false },
    { id: KYCID.KYC_local_frequence, is_mandatory: false },
    { id: KYCID.KYC_saison_frequence, is_mandatory: false },
    { id: KYCID.KYC_alimentation_litres_alcool, is_mandatory: false },
    { id: KYCID.KYC_gaspillage_alimentaire_frequence, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_REDUCTION_DECHETS, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_bilan_consommation: [
    { id: KYCID.KYC_consommation_type_consommateur, is_mandatory: false }, // manque quand import NGC Full
    { id: KYCMosaicID.MOSAIC_LOGEMENT_VACANCES, is_mandatory: false },
    { id: KYCID.KYC_consommation_relation_objets, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_ELECTROMENAGER, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_ANIMAUX, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_APPAREIL_NUM, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_MEUBLES, is_mandatory: false },
    { id: KYCID.KYC_raison_achat_vetements, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_bilan_logement: [
    { id: KYCID.KYC_type_logement, is_mandatory: false },
    { id: KYCID.KYC_menage, is_mandatory: false },
    { id: KYCID.KYC_superficie, is_mandatory: false },
    { id: KYCID.KYC_logement_age, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE, is_mandatory: false },
    { id: KYCID.KYC_temperature, is_mandatory: false },
    // TODO: { id : KYCID.KYC_conso_elec},
    { id: KYCMosaicID.MOSAIC_RENO, is_mandatory: false },
    { id: KYCID.KYC_photovoltaiques, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_EXTERIEUR, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_bilan_transport: [
    { id: KYCID.KYC_transport_avion_3_annees, is_mandatory: false },
    { id: KYCID.KYC_transport_heures_avion_court, is_mandatory: false },
    { id: KYCID.KYC_transport_heures_avion_moyen, is_mandatory: false },
    { id: KYCID.KYC_transport_heures_avion_long, is_mandatory: false },
    { id: KYCID.KYC_transport_type_utilisateur, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_km, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_nbr_voyageurs, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_gabarit, is_mandatory: false },
    { id: KYCID.KYC_transport_voiture_motorisation, is_mandatory: false },
    {
      id: KYCID.KYC_transport_voiture_thermique_carburant,
      is_mandatory: false,
    },
    // NOTE: attendre que tous les fronts aient implémenté la possibilité
    // de passer les questions.
    // { id : KYCID.KYC_transport_voiture_electrique_consommation},
    // { id : KYCID.KYC_transport_voiture_thermique_consomation_carburant},
    { id: KYCID.KYC_transport_2roues_usager, is_mandatory: false },
    { id: KYCID.KYC_2roue_motorisation_type, is_mandatory: false },
    { id: KYCID.KYC_2roue_km, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_mini_bilan_carbone: [
    { id: KYCID.KYC_transport_voiture_km, is_mandatory: false },
    { id: KYCID.KYC_transport_avion_3_annees, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE, is_mandatory: false },
    { id: KYCID.KYC_superficie, is_mandatory: false },
    { id: KYCID.KYC_menage, is_mandatory: false },
    { id: KYCID.KYC_alimentation_regime, is_mandatory: false },
    { id: KYCID.KYC_consommation_type_consommateur, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_personnalisation_alimentation: [
    { id: KYCID.KYC_alimentation_regime, is_mandatory: false },
    { id: KYCID.KYC_saison_frequence, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_REDUCTION_DECHETS, is_mandatory: false },
    { id: KYCID.KYC_local_frequence, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_personnalisation_consommation: [
    { id: KYCID.KYC_consommation_relation_objets, is_mandatory: false },
    { id: KYCID.KYC_consommation_type_consommateur, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_personnalisation_logement: [
    { id: KYCID.KYC_type_logement, is_mandatory: false },
    { id: KYCID.KYC_proprietaire, is_mandatory: false },
    { id: KYCID.KYC_jardin, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_CHAUFFAGE, is_mandatory: false },
    { id: KYCMosaicID.MOSAIC_RENO, is_mandatory: false },
  ],
  ENCHAINEMENT_KYC_personnalisation_transport: [
    { id: KYCID.KYC_transport_avion_3_annees, is_mandatory: false },
    { id: KYCID.KYC003, is_mandatory: false },
    { id: KYCID.KYC_possede_voiture_oui_non, is_mandatory: false },
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
  public static getKycDefinitionsByEnchainementID(
    enchainement_id: EnchainementID,
  ): KycDansEnchainement[] {
    const liste = EnchainementDefinitionData[enchainement_id];
    return liste ? liste : [];
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
