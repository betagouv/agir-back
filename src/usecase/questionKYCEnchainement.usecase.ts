import { Injectable } from '@nestjs/common';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { Enchainement } from '../domain/kyc/enchainement';
import { EnchainementKYC } from '../domain/kyc/enchainementKYC';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { ActionUsecase } from './actions.usecase';

@Injectable()
export class QuestionKYCEnchainementUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private actionRepository: ActionRepository,
    private personnalisator: Personnalisator,
    private actionUsecase: ActionUsecase,
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

    if (!Enchainement[enchainementId]) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    const liste_kycs_codes =
      QuestionKYCEnchainementUsecase.ENCHAINEMENTS[enchainementId];

    const result =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(liste_kycs_codes);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }
  async getFirst(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setFirst();

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getNext(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setNext(current_kyc_code);

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getPrevious(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setPrevious(current_kyc_code);

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  private listeKycFromEnchainementId(
    enchainementId: string,
    utilisateur: Utilisateur,
  ): QuestionKYC[] {
    const is_enchainement_simultateur = this.isSimulateurId(enchainementId);
    const is_enchainement_bilan = this.isBilanId(enchainementId);

    if (
      !Enchainement[enchainementId] &&
      !is_enchainement_simultateur &&
      !is_enchainement_bilan
    ) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    if (is_enchainement_simultateur) {
      const action_def = this.actionRepository.getActionDefinitionByTypeCode(
        ActionDefinition.getTypeCodeFromString(enchainementId),
      );
      return utilisateur.kyc_history.getListeKycsFromCodes(
        action_def.kyc_codes,
      );
    }

    if (is_enchainement_bilan) {
      const action_code =
        ActionDefinition.getTypeCodeFromString(enchainementId).code;
      const kyc_codes =
        this.actionUsecase.external_get_kyc_codes_from_action_bilan(
          action_code,
        );
      return utilisateur.kyc_history.getListeKycsFromCodes(kyc_codes);
    }

    return utilisateur.kyc_history.getListeKycsFromCodes(
      QuestionKYCEnchainementUsecase.ENCHAINEMENTS[enchainementId],
    );
  }

  private isSimulateurId(id: string): boolean {
    const action = ActionDefinition.getTypeCodeFromString(id);
    return this.actionRepository.isSimulateur(action);
  }
  private isBilanId(id: string): boolean {
    const action = ActionDefinition.getTypeCodeFromString(id);
    return this.actionRepository.isBilan(action);
  }
}
