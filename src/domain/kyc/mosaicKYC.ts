import { App } from '../app';
import { Categorie } from '../contenu/categorie';
import { Thematique } from '../thematique/thematique';
import { KYCID } from './KYCID';
import { KYCMosaicID } from './KYCMosaicID';

export class KYCMosaicReponse {
  code: string;
  label: string;
  image_url: string;
  emoji: string;
  boolean_value: boolean;
}

export enum TypeMosaic {
  mosaic_boolean = 'mosaic_boolean',
  mosaic_number = 'mosaic_number',
}

export type MosaicKYCDef = {
  id: KYCMosaicID;
  titre: string;
  type: TypeMosaic;
  categorie: Categorie;
  points: number;
  question_kyc_codes: KYCID[];
  thematique: Thematique;
};

export class MosaicKYC_CATALOGUE {
  id: KYCMosaicID;
  titre: string;
  type: TypeMosaic;
  categorie: Categorie;
  points: number;
  reponses: KYCMosaicReponse[];

  static MOSAIC_CATALOGUE: MosaicKYCDef[] = [
    {
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
    {
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
      ],
      thematique: Thematique.logement,
    },
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
  ];

  public static listMosaicIDs(): KYCMosaicID[] {
    return MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE.filter(
      (m) => m.categorie !== Categorie.test || !App.isProd(),
    ).map((m) => m.id);
  }

  public static isMosaicID(id: string): boolean {
    return (
      MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE.findIndex((m) => m.id === id) > -1
    );
  }

  static findMosaicDefByID(mosaicID: KYCMosaicID): MosaicKYCDef {
    if (!mosaicID) return null;
    return MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE.find((m) => m.id === mosaicID);
  }

  static hasCode(mosaicID: KYCMosaicID, code: string): boolean {
    const mosaic = MosaicKYC_CATALOGUE.findMosaicDefByID(mosaicID);
    const found = mosaic.question_kyc_codes.find((c) => c === code);
    return !!found;
  }
}
