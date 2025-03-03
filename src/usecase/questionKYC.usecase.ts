import { Injectable } from '@nestjs/common';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { MosaicKYC_CATALOGUE, TypeMosaic } from '../domain/kyc/mosaicKYC';
import {
  BooleanKYC,
  QuestionKYC,
  TypeReponseQuestionKYC,
} from '../domain/kyc/questionKYC';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';

const FIELD_MAX_LENGTH = 280;

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
export class QuestionKYCUsecase {
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
      KYCID.KYC_transport_voiture_km,
      KYCID.KYC_transport_avion_3_annees,
      KYCID.KYC_transport_type_utilisateur,
      KYCID.KYC_transport_voiture_nbr_voyageurs,
      KYCID.KYC_transport_voiture_motorisation,
      KYCID.KYC_transport_heures_avion_court,
      KYCID.KYC_transport_heures_avion_moyen,
      KYCID.KYC_transport_heures_avion_long,
      KYCID.KYC_transport_2roues_usager,
      KYCID.KYC_2roue_motorisation_type,
      KYCID.KYC_2roue_km,
    ],
    ENCHAINEMENT_KYC_bilan_logement: [
      KYCMosaicID.MOSAIC_CHAUFFAGE,
      KYCID.KYC_superficie,
      KYCID.KYC_menage,
      KYCID.KYC_type_logement,
      KYCID.KYC_logement_age,
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
      KYCID.KYC008,
      KYCID.KYC_transport_voiture_thermique_carburant,
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

  async getALL(utilisateurId: string): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const result = utilisateur.kyc_history.getAllUpToDateQuestionSet();
    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.kyc],
    );

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  async getEnchainementQuestions(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kycs_ids = QuestionKYCUsecase.ENCHAINEMENTS[enchainementId];

    if (!liste_kycs_ids) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    const result =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(liste_kycs_ids);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  async getQuestion(
    utilisateurId: string,
    questionId: string,
  ): Promise<QuestionKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    let result_kyc: QuestionKYC;

    if (MosaicKYC_CATALOGUE.isMosaicID(questionId)) {
      const mosaic_def = MosaicKYC_CATALOGUE.findMosaicDefByID(
        KYCMosaicID[questionId],
      );

      if (!mosaic_def) {
        ApplicationError.throwUnknownMosaicId(questionId);
      }
      result_kyc = utilisateur.kyc_history.getUpToDateMosaic(mosaic_def);
    } else {
      result_kyc =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(
          questionId,
        );
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result_kyc, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
    ]);
  }

  async updateResponseKYC_v2(
    utilisateurId: string,
    code_question: string,
    reponse: { code?: string; value?: string; selected?: boolean }[],
  ): Promise<void> {
    if (!reponse || reponse.length === 0) {
      ApplicationError.throwNoKYCResponse(code_question);
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.gamification,
        Scope.missions,
        Scope.gamification,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    this.updateQuestionOfCode_v2(code_question, reponse, utilisateur, true);

    utilisateur.missions.recomputeRecoDefi(
      utilisateur,
      DefiRepository.getCatalogue(),
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private dispatchKYCUpdateToOtherKYCsPostUpdate(
    code_question: string,
    utilisateur: Utilisateur,
  ) {
    const question_depart =
      utilisateur.kyc_history.getUpToDateAnsweredQuestionByCode(code_question);
    switch (question_depart.code) {
      case KYCID.KYC_alimentation_regime:
        this.synchroAlimentationRegime(question_depart, utilisateur);
        break;
      default:
        break;
    }
  }

  async updateResponseMosaic_v2(
    utilisateurId: string,
    mosaicId: string,
    reponses_code_selected: {
      code: string;
      value?: string;
      selected?: boolean;
    }[],
  ): Promise<void> {
    if (
      !reponses_code_selected ||
      reponses_code_selected.length === undefined ||
      reponses_code_selected.length === 0
    ) {
      ApplicationError.throwMissingMosaicData();
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.gamification,
        Scope.missions,
        Scope.gamification,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const mosaic = MosaicKYC_CATALOGUE.findMosaicDefByID(KYCMosaicID[mosaicId]);
    if (!mosaic) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    if (reponses_code_selected.length !== mosaic.question_kyc_codes.length) {
      ApplicationError.throwBadMosaicDataNumber(
        mosaicId,
        mosaic.question_kyc_codes.length,
      );
    }

    for (const code_selected of reponses_code_selected) {
      if (!MosaicKYC_CATALOGUE.hasCode(mosaic.id, code_selected.code)) {
        ApplicationError.throwQuestionBadCodeValue(
          code_selected.code,
          mosaicId,
        );
      }
    }

    if (mosaic.type === TypeMosaic.mosaic_boolean) {
      for (const code_selected of reponses_code_selected) {
        const kyc = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          code_selected.code,
        );
        if (kyc) {
          if (kyc.type === TypeReponseQuestionKYC.entier) {
            this.updateQuestionOfCode_v2(
              code_selected.code,
              [{ value: code_selected.selected ? '1' : '0' }],
              utilisateur,
              false,
            );
            //kyc.setReponseSimpleValue(code_selected.selected ? '1' : '0');
          } else if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
            this.updateQuestionOfCode_v2(
              code_selected.code,
              [
                {
                  code: code_selected.selected
                    ? BooleanKYC.oui
                    : BooleanKYC.non,
                  selected: true,
                },
              ],
              utilisateur,
              false,
            );
            //kyc.selectChoixUniqueByCode(code_selected.selected ? BooleanKYC.oui : BooleanKYC.non);
          } else {
            ApplicationError.throwBadMosaiConfigurationError(mosaicId);
          }
        }
      }
    }

    if (!utilisateur.kyc_history.isMosaicAnswered(mosaic.id)) {
      utilisateur.gamification.ajoutePoints(mosaic.points, utilisateur);
    }

    utilisateur.kyc_history.addAnsweredMosaic(mosaic.id);
    utilisateur.missions.answerMosaic(mosaic.id);

    utilisateur.missions.recomputeRecoDefi(
      utilisateur,
      DefiRepository.getCatalogue(),
    );

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private updateQuestionOfCode_v2(
    code_question: string,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
    utilisateur: Utilisateur,
    gain_points: boolean,
  ) {
    const question_to_update =
      utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(
        code_question,
      );

    if (!question_to_update.is_answered && gain_points) {
      utilisateur.gamification.ajoutePoints(
        question_to_update.points,
        utilisateur,
      );
    }

    if (question_to_update.isSimpleQuestion()) {
      this.updateSimpleQuestion(question_to_update, input_reponse_payload);
    }
    if (question_to_update.isChoixUnique()) {
      this.updateQuestionChoixUnique(question_to_update, input_reponse_payload);
    }
    if (question_to_update.isChoixMultiple()) {
      this.updateQuestionChoixMultiple(
        question_to_update,
        input_reponse_payload,
      );
    }
    utilisateur.kyc_history.updateQuestionInHistory(question_to_update);

    utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
      question_to_update,
      utilisateur,
    );

    utilisateur.missions.answerKyc(code_question);

    this.dispatchKYCUpdateToOtherKYCsPostUpdate(code_question, utilisateur);

    utilisateur.recomputeRecoTags();
  }

  private updateSimpleQuestion(
    question_to_update: QuestionKYC,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    if (input_reponse_payload.length !== 1) {
      ApplicationError.throwUniqueReponseExpected(question_to_update.code);
    }
    if (!input_reponse_payload[0].value) {
      ApplicationError.throwMissingValue(question_to_update.code);
    }
    if (question_to_update.isChampLibre()) {
      if (input_reponse_payload[0].value.length > FIELD_MAX_LENGTH) {
        ApplicationError.throwTooBigData(
          'value',
          input_reponse_payload[0].value,
          FIELD_MAX_LENGTH,
        );
      }
    }
    question_to_update.setReponseSimpleValue(input_reponse_payload[0].value);
  }
  private updateQuestionChoixUnique(
    question_to_update: QuestionKYC,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    let already_found = false;

    let target_code = null;

    for (const code_selected_element of input_reponse_payload) {
      target_code = code_selected_element.selected
        ? code_selected_element.code
        : null;

      if (!!target_code && already_found) {
        ApplicationError.throwToManySelectedAttributesForKYC(
          question_to_update.code,
          target_code,
        );
      }

      if (target_code) {
        question_to_update.selectChoixUniqueByCode(target_code);
        already_found = true;
      }
    }
    if (!already_found) {
      ApplicationError.throwNoneSelectedButNeededOne(question_to_update.code);
    }
  }

  private updateQuestionChoixMultiple(
    question_to_update: QuestionKYC,
    input_reponse_payload: {
      code?: string;
      value?: string;
      selected?: boolean;
    }[],
  ) {
    for (const code_ref of question_to_update.getAllCodes()) {
      const answered_element = input_reponse_payload.find(
        (r) => r.code === code_ref,
      );
      if (!answered_element) {
        ApplicationError.throwMissingValueForCode(
          question_to_update.code,
          code_ref,
        );
      }
      if (
        answered_element.selected === undefined ||
        answered_element.selected === null
      ) {
        ApplicationError.throwMissingSelectedAttributeForCode(
          question_to_update.code,
          code_ref,
        );
      }
      question_to_update.setChoixByCode(code_ref, answered_element.selected);
    }
  }

  private synchroAlimentationRegime(
    kyc: QuestionKYC,
    utilisateur: Utilisateur,
  ) {
    const code_reponse_unique = kyc.getCodeReponseQuestionChoixUnique();
    if (!code_reponse_unique) return;

    if (code_reponse_unique === 'vegetalien') {
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetaliens,
        ['14'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetariens,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_blanc,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_gras,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_blanche,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_rouge,
        ['0'],
      );
    }
    if (code_reponse_unique === 'vegetarien') {
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetaliens,
        ['3'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetariens,
        ['11'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_blanc,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_gras,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_blanche,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_rouge,
        ['0'],
      );
    }
    if (code_reponse_unique === 'peu_viande') {
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetaliens,
        ['1'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetariens,
        ['7'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_blanc,
        ['1'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_gras,
        ['1'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_blanche,
        ['4'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_rouge,
        ['0'],
      );
    }
    if (code_reponse_unique === 'chaque_jour_viande') {
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetaliens,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_vegetariens,
        ['0'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_blanc,
        ['1'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_poisson_gras,
        ['1'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_blanche,
        ['6'],
      );
      utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
        KYCID.KYC_nbr_plats_viande_rouge,
        ['6'],
      );
    }
  }
}
