import { App } from '../app';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../thematique/thematique';
import { KYCID } from './KYCID';
import { MosaicKYCDef, TypeMosaic } from './mosaicKYC';

export enum KYCMosaicID {
  TEST_MOSAIC_ID = 'TEST_MOSAIC_ID',
  MOSAIC_CHAUFFAGE = 'MOSAIC_CHAUFFAGE',
  MOSAIC_RENO = 'MOSAIC_RENO',
  MOSAIC_EXTERIEUR = 'MOSAIC_EXTERIEUR',
  MOSAIC_LOGEMENT_VACANCES = 'MOSAIC_LOGEMENT_VACANCES',
  MOSAIC_ELECTROMENAGER = 'MOSAIC_ELECTROMENAGER',
  MOSAIC_REDUCTION_DECHETS = 'MOSAIC_REDUCTION_DECHETS',
  MOSAIC_ANIMAUX = 'MOSAIC_ANIMAUX',
  MOSAIC_APPAREIL_NUM = 'MOSAIC_APPAREIL_NUM',
  MOSAIC_MEUBLES = 'MOSAIC_MEUBLES',
  MOSAIC_VETEMENTS = 'MOSAIC_VETEMENTS',
  MOSAIC_ELECTRO_CUISSON_WINTER = 'MOSAIC_ELECTRO_CUISSON_WINTER',
  MOSAIC_ELECTRO_FROID_WINTER = 'MOSAIC_ELECTRO_FROID_WINTER',
  MOSAIC_SALON_WINTER = 'MOSAIC_SALON_WINTER',
  MOSAIC_LAVAGE_WINTER = 'MOSAIC_LAVAGE_WINTER',
  MOSAIC_MOBILITE_ELEC_WINTER = 'MOSAIC_MOBILITE_ELEC_WINTER',
}

export const MosaicDefinition: Record<KYCMosaicID, MosaicKYCDef> = {
  TEST_MOSAIC_ID: {
    id: KYCMosaicID.TEST_MOSAIC_ID,
    categorie: Categorie.test,
    points: 10,
    titre: 'Quels modes de chauffage existent chez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_chauffage_bois,
      KYCID.KYC_chauffage_fioul,
      KYCID.KYC_chauffage_gaz,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_CHAUFFAGE: {
    id: KYCMosaicID.MOSAIC_CHAUFFAGE,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels modes de chauffage existent chez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_chauffage_bois,
      KYCID.KYC_chauffage_fioul,
      KYCID.KYC_chauffage_gaz,
      KYCID.KYC_chauffage_elec,
      KYCID.KYC_chauffage_pompe_chaleur,
      KYCID.KYC_chauffage_reseau,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_RENO: {
    id: KYCMosaicID.MOSAIC_RENO,
    categorie: Categorie.mission,
    points: 5,
    titre:
      'Des travaux de rénovation ont-ils été réalisés dans votre logement (hors rafraîchissement) depuis 2000 ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_logement_reno_second_oeuvre,
      KYCID.KYC_logement_reno_isolation,
      KYCID.KYC_logement_reno_chauffage,
      KYCID.KYC_logement_reno_extension,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_EXTERIEUR: {
    id: KYCMosaicID.MOSAIC_EXTERIEUR,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Que possédez-vous dans votre extérieur (jardin, balcon) ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_logement_exterieur_salon_bois,
      KYCID.KYC_logement_exterieur_salon_resine_metal,
      KYCID.KYC_logement_exterieur_tondeuse_elec,
      KYCID.KYC_logement_exterieur_tondeuse_therm,
      KYCID.KYC_logement_exterieur_bbq_elec_gaz,
      KYCID.KYC_logement_exterieur_bbq_charbon,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_LOGEMENT_VACANCES: {
    id: KYCMosaicID.MOSAIC_LOGEMENT_VACANCES,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Comment êtes-vous hébergé pour vos week-ends, vos vacances ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_consommation_logement_vacances_hotel,
      KYCID.KYC_consommation_logement_vacances_camping,
      KYCID.KYC_consommation_logement_vacances_auberge_jeunesse,
      KYCID.KYC_consommation_logement_vacances_locations,
      KYCID.KYC_consommation_logement_vacance_famille,
      KYCID.KYC_consommation_logement_vacances_echange,
      KYCID.KYC_consommation_logement_vacances_secondaire,
    ],
    thematique: Thematique.loisir,
  },
  MOSAIC_ELECTROMENAGER: {
    id: KYCMosaicID.MOSAIC_ELECTROMENAGER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils électroménagers possédez-vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_electro_robot_cuisine,
      KYCID.KYC_electro_aspirateur,
      KYCID.KYC_electro_cafetiere,
      KYCID.KYC_electro_bouilloire,
      KYCID.KYC_electro_hotte,
      KYCID.KYC_electro_plaques,
      KYCID.KYC_electro_micro_onde,
      KYCID.KYC_electro_four,
      KYCID.KYC_electro_lave_vaiselle,
      KYCID.KYC_electro_seche_linge,
      KYCID.KYC_electro_lave_linge,
    ],
    thematique: Thematique.consommation,
  },
  MOSAIC_ELECTRO_CUISSON_WINTER: {
    id: KYCMosaicID.MOSAIC_ELECTRO_CUISSON_WINTER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils de cuisson possédez-vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_electro_four_elec,
      KYCID.KYC_electro_four_gaz,
      KYCID.KYC_electro_plaques_gaz,
      KYCID.KYC_electro_plaques,
      KYCID.KYC_electro_micro_onde,
      KYCID.KYC_electro_four_externe,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_SALON_WINTER: {
    id: KYCMosaicID.MOSAIC_SALON_WINTER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils de salon avez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_appareil_console_salon,
      KYCID.KYC_appareil_box_internet,
      KYCID.KYC_appareil_television,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_LAVAGE_WINTER: {
    id: KYCMosaicID.MOSAIC_LAVAGE_WINTER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils de lavage possédez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_electro_lave_vaiselle,
      KYCID.KYC_electro_lave_linge,
      KYCID.KYC_electro_seche_linge,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_MOBILITE_ELEC_WINTER: {
    id: KYCMosaicID.MOSAIC_MOBILITE_ELEC_WINTER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils de mobilité électrique possédez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_transport_nbr_voitures_elec,
      KYCID.KYC_transport_nbr_velo_elec,
      KYCID.KYC_transport_nbr_scooter_elec,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_ELECTRO_FROID_WINTER: {
    id: KYCMosaicID.MOSAIC_ELECTRO_FROID_WINTER,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels appareils de refroidissement possédez vous ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_electro_petit_refrigerateur,
      KYCID.KYC_electro_refrigerateur,
      KYCID.KYC_logement_frigo_americain,
      KYCID.KYC_electro_congelateur,
      KYCID.KYC_electro_cave_a_vin,
    ],
    thematique: Thematique.logement,
  },
  MOSAIC_REDUCTION_DECHETS: {
    id: KYCMosaicID.MOSAIC_REDUCTION_DECHETS,
    categorie: Categorie.mission,
    points: 5,
    titre: 'Quels éco-gestes mettez-vous en place pour réduire vos déchets ?',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_alimentation_compostage,
      KYCID.KYC_alimentation_reduc_gaspi_alim,
      KYCID.KYC_alimentation_stoppub,
      KYCID.KYC_alimentation_achat_vrac,
    ],
    thematique: Thematique.dechet,
  },
  MOSAIC_ANIMAUX: {
    id: KYCMosaicID.MOSAIC_ANIMAUX,
    categorie: Categorie.mission,
    points: 5,
    titre: `Quels animaux vivent avec vous, au sein de votre foyer ?`,
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_consommation_petit_chien,
      KYCID.KYC_consommation_moyen_chien,
      KYCID.KYC_consommation_grand_chien,
      KYCID.KYC_consommation_chat,
    ],
    thematique: Thematique.loisir,
  },
  MOSAIC_APPAREIL_NUM: {
    id: KYCMosaicID.MOSAIC_APPAREIL_NUM,
    categorie: Categorie.mission,
    points: 5,
    titre: `Quels appareils numériques possédez-vous ?`,
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_appareil_telephone,
      KYCID.KYC_appareil_television,
      KYCID.KYC_appareil_ordi_portable,
      KYCID.KYC_appareil_ordi_fixe,
      KYCID.KYC_appareil_tablette,
      KYCID.KYC_appareil_enceinte_bluetooth,
      KYCID.KYC_appareil_console_salon,
      KYCID.KYC_appareil_console_portable,
      KYCID.KYC_appareil_imprimante_nbr,
    ],
    thematique: Thematique.consommation,
  },
  MOSAIC_MEUBLES: {
    id: KYCMosaicID.MOSAIC_MEUBLES,
    categorie: Categorie.mission,
    points: 5,
    titre: `Quels meubles de moins de 10 ans possédez-vous ?`,
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_meuble_armoire,
      KYCID.KYC_meuble_canape,
      KYCID.KYC_meuble_chaise,
      KYCID.KYC_meuble_grand_meuble,
      KYCID.KYC_meuble_lit,
      KYCID.KYC_meuble_matelas,
      KYCID.KYC_meuble_petit_meuble,
      KYCID.KYC_meuble_table,
    ],
    thematique: Thematique.consommation,
  },
  MOSAIC_VETEMENTS: {
    id: KYCMosaicID.MOSAIC_VETEMENTS,
    categorie: Categorie.mission,
    points: 5,
    titre: `Quels vêtements achetez-vous neufs en général dans une année ?`,
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [
      KYCID.KYC_achat_chaussure,
      KYCID.KYC_achat_chemise,
      KYCID.KYC_achat_manteau,
      KYCID.KYC_achat_pantalon,
      KYCID.KYC_achat_pull,
      KYCID.KYC_achat_petit_article,
      KYCID.KYC_achat_gros_article,
      KYCID.KYC_achat_robe,
      KYCID.KYC_achat_short,
      KYCID.KYC_achat_sweat,
      KYCID.KYC_achat_tshirt,
    ],
    thematique: Thematique.consommation,
  },
};
export class MosaicCatalogue {
  public static listMosaicIDs(): KYCMosaicID[] {
    const result: KYCMosaicID[] = [];
    for (const [mosaic_id, mosaic_def] of Object.entries(MosaicDefinition)) {
      if (!mosaic_def) {
        continue;
      }
      if (mosaic_def.categorie !== Categorie.test || !App.isProd()) {
        result.push(KYCMosaicID[mosaic_id]);
      }
    }
    return result;
  }

  public static isMosaicID(id: string): boolean {
    return !!KYCMosaicID[id];
  }

  static findMosaicDefByID(mosaicID: KYCMosaicID): MosaicKYCDef {
    return MosaicDefinition[mosaicID];
  }

  static hasCode(mosaicID: KYCMosaicID, code: string): boolean {
    const mosaic = MosaicCatalogue.findMosaicDefByID(mosaicID);
    const found = mosaic.question_kyc_codes.find((c) => c === code);
    return !!found;
  }
}
