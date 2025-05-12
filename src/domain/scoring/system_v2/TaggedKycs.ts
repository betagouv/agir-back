import { KYCID } from '../../kyc/KYCID';

export class TaggedKycs {
  private static kyc_liste: KYCID[] = [
    KYCID.KYC_proprietaire,
    KYCID.KYC_transport_avion_3_annees,
    KYCID.KYC003,
    KYCID.KYC_possede_voiture_oui_non,
    KYCID.KYC_transport_voiture_motorisation,
    KYCID.KYC_nbr_plats_viande_rouge,
    KYCID.KYC_saison_frequence,
    KYCID.KYC_alimentation_compostage,
    KYCID.KYC_local_frequence,
    KYCID.KYC_type_logement,
    KYCID.KYC_proprietaire,
    KYCID.KYC_jardin,
    KYCID.KYC_chauffage_elec,
    KYCID.KYC_logement_reno_chauffage,
    KYCID.KYC_logement_reno_extension,
    KYCID.KYC_logement_reno_isolation,
    KYCID.KYC_logement_reno_second_oeuvre,
    KYCID.KYC_consommation_relation_objets,
    KYCID.KYC_consommation_type_consommateur,
  ];

  public static getTaggedKycs(): KYCID[] {
    return this.kyc_liste;
  }
}
