import { Injectable } from '@nestjs/common';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { EnchainementKYC } from '../domain/kyc/enchainementKYC';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { EnchainementKYCExclude } from '../infrastructure/api/types/kyc/enchainementKYCAPI';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';

export enum Enchainement {
  ENCHAINEMENT_KYC_1 = 'ENCHAINEMENT_KYC_1',
  ENCHAINEMENT_KYC_mini_bilan_carbone = 'ENCHAINEMENT_KYC_mini_bilan_carbone',
  ENCHAINEMENT_KYC_bilan_transport = 'ENCHAINEMENT_KYC_bilan_transport',
  ENCHAINEMENT_KYC_bilan_logement = 'ENCHAINEMENT_KYC_bilan_logement',
  ENCHAINEMENT_KYC_bilan_consommation = 'ENCHAINEMENT_KYC_bilan_consommation',
  ENCHAINEMENT_KYC_bilan_alimentation = 'ENCHAINEMENT_KYC_bilan_alimentation',
  ENCHAINEMENT_KYC_personnalisation_alimentation = 'ENCHAINEMENT_KYC_personnalisation_alimentation',
  ENCHAINEMENT_KYC_personnalisation_logement = 'ENCHAINEMENT_KYC_personnalisation_logement',
  ENCHAINEMENT_KYC_personnalisation_transport = 'ENCHAINEMENT_KYC_personnalisation_transport',
  ENCHAINEMENT_KYC_personnalisation_consommation = 'ENCHAINEMENT_KYC_personnalisation_consommation',
}

@Injectable()
export class QuestionKYCEnchainementUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  static ENCHAINEMENTS: { [key in Enchainement]?: (KYCID | KYCMosaicID)[] } = {
    ENCHAINEMENT_KYC_1: [KYCID.KYC001, KYCMosaicID.TEST_MOSAIC_ID],
    ENCHAINEMENT_KYC_mini_bilan_carbone: [
      KYCID.KYC_transport_voiture_km,
      KYCID.KYC_transport_avion_3_annees,
      KYCMosaicID.MOSAIC_CHAUFFAGE,
      KYCID.KYC_superficie,
      KYCID.KYC_menage,
      KYCID.KYC_alimentation_regime,
      KYCID.KYC_consommation_type_consommateur,
    ],
    ENCHAINEMENT_KYC_bilan_transport: [
      KYCID.KYC_transport_avion_3_annees,
      KYCID.KYC_transport_heures_avion_court,
      KYCID.KYC_transport_heures_avion_moyen,
      KYCID.KYC_transport_heures_avion_long,
      KYCID.KYC_transport_type_utilisateur,
      KYCID.KYC_transport_voiture_km,
      KYCID.KYC_transport_voiture_nbr_voyageurs,
      KYCID.KYC_transport_voiture_gabarit,
      KYCID.KYC_transport_voiture_motorisation,
      KYCID.KYC_transport_voiture_thermique_carburant,
      // NOTE: attendre que tous les fronts aient implémenté la possibilité
      // de passer les questions.
      // KYCID.KYC_transport_voiture_electrique_consommation,
      // KYCID.KYC_transport_voiture_thermique_consomation_carburant,
      KYCID.KYC_transport_2roues_usager,
      KYCID.KYC_2roue_motorisation_type,
      KYCID.KYC_2roue_km,
    ],
    ENCHAINEMENT_KYC_bilan_logement: [
      KYCID.KYC_type_logement,
      KYCID.KYC_menage,
      KYCID.KYC_superficie,
      KYCID.KYC_logement_age,
      KYCMosaicID.MOSAIC_CHAUFFAGE,
      KYCID.KYC_temperature,
      // TODO: KYCID.KYC_conso_elec,
      KYCMosaicID.MOSAIC_RENO,
      KYCID.KYC_photovoltaiques,
      KYCMosaicID.MOSAIC_EXTERIEUR,
    ],
    ENCHAINEMENT_KYC_bilan_consommation: [
      KYCID.KYC_consommation_type_consommateur, // manque quand import NGC Full
      KYCMosaicID.MOSAIC_LOGEMENT_VACANCES,
      KYCID.KYC_consommation_relation_objets,
      KYCMosaicID.MOSAIC_ELECTROMENAGER,
      KYCMosaicID.MOSAIC_ANIMAUX,
      KYCMosaicID.MOSAIC_APPAREIL_NUM,
      KYCMosaicID.MOSAIC_MEUBLES,
      KYCMosaicID.MOSAIC_VETEMENTS,
    ],
    ENCHAINEMENT_KYC_bilan_alimentation: [
      KYCID.KYC_alimentation_regime, // manque quand import NGC Full
      KYCID.KYC_petitdej,
      KYCID.KYC_local_frequence,
      KYCID.KYC_saison_frequence,
      KYCID.KYC_alimentation_litres_alcool,
      KYCID.KYC_gaspillage_alimentaire_frequence,
      KYCMosaicID.MOSAIC_REDUCTION_DECHETS,
    ],
    ENCHAINEMENT_KYC_personnalisation_alimentation: [
      KYCID.KYC_alimentation_regime,
      KYCID.KYC_saison_frequence,
      KYCMosaicID.MOSAIC_REDUCTION_DECHETS,
      KYCID.KYC_local_frequence,
    ],
    ENCHAINEMENT_KYC_personnalisation_transport: [
      KYCID.KYC_transport_avion_3_annees,
      KYCID.KYC003,
      KYCID.KYC_possede_voiture_oui_non,
      KYCID.KYC_transport_voiture_motorisation,
    ],
    ENCHAINEMENT_KYC_personnalisation_logement: [
      KYCID.KYC_type_logement,
      KYCID.KYC_proprietaire,
      KYCID.KYC_jardin,
      KYCMosaicID.MOSAIC_CHAUFFAGE,
      KYCMosaicID.MOSAIC_RENO,
    ],
    ENCHAINEMENT_KYC_personnalisation_consommation: [
      KYCID.KYC_consommation_relation_objets,
      KYCID.KYC_consommation_type_consommateur,
    ],
  };

  async getEnchainementQuestions(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = this.getListKycFromEnchainementId(
      enchainementId,
      utilisateur,
      true,
    );

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }
  async getFirstOfEnchainementQuestionsWithExcludes(
    utilisateurId: string,
    enchainementId: string,
    excludes: EnchainementKYCExclude[],
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.getListKycFromEnchainementId(
      enchainementId,
      utilisateur,
      false,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    if (excludes.length === 0) {
      enchainement.setFirst();
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          enchainement.setFirstToAnswer();
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          enchainement.setFirstEligible();
        }
      } else {
        enchainement.setFirstToAnswerEligible();
      }
    }

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  async getNextWithExcludes(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.getListKycFromEnchainementId(
      enchainementId,
      utilisateur,
      false,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    if (excludes.length === 0) {
      enchainement.setNextKyc(current_kyc_code);
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          enchainement.setNextKycNonRepondu(current_kyc_code);
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          enchainement.setNextKycEligible(current_kyc_code);
        }
      } else {
        enchainement.setNextKycEligibleNonRepondu(current_kyc_code);
      }
    }

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  async getPreviousWithExcludes(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
    excludes: EnchainementKYCExclude[],
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.getListKycFromEnchainementId(
      enchainementId,
      utilisateur,
      false,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    if (excludes.length === 0) {
      enchainement.setPreviousKyc(current_kyc_code);
    } else {
      if (excludes.length === 1) {
        if (excludes.includes(EnchainementKYCExclude.repondu)) {
          enchainement.setPreviousKycNonRepondu(current_kyc_code);
        }
        if (excludes.includes(EnchainementKYCExclude.non_eligible)) {
          enchainement.setPreviousKycEligible(current_kyc_code);
        }
      } else {
        enchainement.setPreviousKycEligibleNonRepondu(current_kyc_code);
      }
    }

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  private getListKycFromEnchainementId(
    enchainementId: string,
    utilisateur: Utilisateur,
    eligibles: boolean,
  ) {
    const liste_kycs_codes =
      QuestionKYCEnchainementUsecase.ENCHAINEMENTS[enchainementId];

    if (!liste_kycs_codes) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    if (eligibles) {
      return utilisateur.kyc_history.getEnchainementKYCsEligibles(
        liste_kycs_codes,
      );
    } else {
      return utilisateur.kyc_history.getListeKycsFromCodes(liste_kycs_codes);
    }
  }
}
