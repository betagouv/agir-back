import { Injectable } from '@nestjs/common';
import { QuestionKYC, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Scope, Utilisateur } from '../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { DefiRepository } from '../../src/infrastructure/repository/defi.repository';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { MosaicKYC, TypeReponseMosaicKYC } from '../domain/kyc/mosaicKYC';
import { ApplicationError } from '../infrastructure/applicationError';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { QuestionGeneric } from '../domain/kyc/questionGeneric';
import { EnchainementQuestions } from '../domain/kyc/enchainementQuestions';

@Injectable()
export class QuestionKYCUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private kycRepository: KycRepository,
    private defiRepository: DefiRepository,
    private personnalisator: Personnalisator,
  ) {}

  static ENCHAINEMENTS: Record<string, string[]> = {
    ENCHAINEMENT_KYC_1: [
      KYCID.KYC001,
      KYCID.KYC002,
      KYCID.KYC003,
      KYCMosaicID.TEST_MOSAIC_ID,
    ],
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
      KYCID.KYC006,
      KYCMosaicID.MOSAIC_RENO,
      KYCID.KYC_photovoltaiques,
      KYCMosaicID.MOSAIC_EXTERIEUR,
    ],
    ENCHAINEMENT_KYC_bilan_consommation: [
      KYCID.KYC_consommation_type_consommateur,
      KYCMosaicID.MOSAIC_LOGEMENT_VACANCES,
      KYCID.KYC_consommation_relation_objets,
      KYCMosaicID.MOSAIC_ELECTROMENAGER,
      KYCMosaicID.MOSAIC_ANIMAUX,
      KYCMosaicID.MOSAIC_APPAREIL_NUM,
      KYCMosaicID.MOSAIC_MEUBLES,
      KYCMosaicID.MOSAIC_VETEMENTS,
    ],
    ENCHAINEMENT_KYC_bilan_alimentation: [
      KYCID.KYC_alimentation_regime,
      KYCID.KYC_local_frequence,
      KYCID.KYC_saison_frequence,
      KYCID.KYC_alimentation_litres_alcool,
      KYCID.KYC_gaspillage_alimentaire_frequence,
      KYCMosaicID.MOSAIC_REDUCTION_DECHETS,
    ],
  };

  async getALL(utilisateurId: string): Promise<QuestionGeneric[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const result = utilisateur.kyc_history.getAllUpToDateQuestionSet();
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  async getEnchainementQuestions(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<EnchainementQuestions> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const liste_kycs_ids = QuestionKYCUsecase.ENCHAINEMENTS[enchainementId];

    if (!liste_kycs_ids) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    const result =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(liste_kycs_ids);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  async getQuestion(
    utilisateurId: string,
    questionId: string,
  ): Promise<QuestionGeneric> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    let result_kyc: QuestionKYC;
    let result_mosaic: MosaicKYC;

    if (MosaicKYC.isMosaicID(questionId)) {
      const mosaic_def = MosaicKYC.findMosaicDefByID(KYCMosaicID[questionId]);

      if (!mosaic_def) {
        ApplicationError.throwUnknownMosaicId(questionId);
      }
      result_mosaic = utilisateur.kyc_history.getUpToDateMosaic(mosaic_def);
    } else {
      result_kyc =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(
          questionId,
        );
    }
    await this.utilisateurRepository.updateUtilisateur(utilisateur);

    return {
      kyc: this.personnalisator.personnaliser(result_kyc, utilisateur, [
        CLE_PERSO.espace_insecable,
      ]),
      mosaic: this.personnalisator.personnaliser(result_mosaic, utilisateur, [
        CLE_PERSO.espace_insecable,
      ]),
    };
  }

  async updateResponseKYC(
    utilisateurId: string,
    code_question: string,
    reponse: string[],
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.todo,
        Scope.gamification,
        Scope.missions,
        Scope.gamification,
        Scope.logement,
      ],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    this.updateQuestionOfCode(code_question, null, reponse, utilisateur, true);

    const catalogue_defis = await this.defiRepository.list({});
    utilisateur.missions.recomputeRecoDefi(utilisateur, catalogue_defis);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private dispatchKYCUpdateToOtherKYCsPostUpdate(
    code_question: string,
    utilisateur: Utilisateur,
  ) {
    const question_depart =
      utilisateur.kyc_history.getAnsweredQuestionByCode(code_question);
    switch (question_depart.id) {
      case KYCID.KYC_alimentation_regime:
        this.synchroAlimentationRegime(question_depart, utilisateur);
        break;
      default:
        break;
    }
  }

  async updateResponseMosaic(
    utilisateurId: string,
    mosaicId: string,
    reponses: { code: string; boolean_value: boolean }[],
  ): Promise<void> {
    if (!reponses || reponses.length === 0) {
      ApplicationError.throwMissingMosaicData();
    }

    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.kyc,
        Scope.todo,
        Scope.gamification,
        Scope.missions,
        Scope.gamification,
        Scope.logement,
      ],
    );
    utilisateur.checkState();

    const mosaic = MosaicKYC.findMosaicDefByID(KYCMosaicID[mosaicId]);
    if (!mosaic) {
      ApplicationError.throwUnknownMosaicId(mosaicId);
    }

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    if (mosaic.type === TypeReponseMosaicKYC.mosaic_boolean) {
      for (const reponse of reponses) {
        const kyc = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
          reponse.code,
        );
        if (kyc) {
          if (kyc.type === TypeReponseQuestionKYC.entier) {
            this.updateQuestionOfCode(
              reponse.code,
              null,
              reponse.boolean_value ? ['1'] : ['0'],
              utilisateur,
              false,
            );
          } else {
            this.updateQuestionOfCode(
              reponse.code,
              reponse.boolean_value ? 'oui' : 'non',
              null,
              utilisateur,
              false,
            );
          }
        }
      }
    }

    if (!utilisateur.kyc_history.isMosaicAnswered(mosaic.id)) {
      utilisateur.gamification.ajoutePoints(mosaic.points, utilisateur);
    }

    utilisateur.kyc_history.addAnsweredMosaic(mosaic.id);
    utilisateur.missions.answerMosaic(mosaic.id);

    const catalogue_defis = await this.defiRepository.list({});
    utilisateur.missions.recomputeRecoDefi(utilisateur, catalogue_defis);

    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }

  private updateQuestionOfCode(
    code_question: string,
    code_reponse: string,
    labels_reponse: string[],
    utilisateur: Utilisateur,
    gain_points: boolean,
  ) {
    utilisateur.kyc_history.checkQuestionExistsByCode(code_question);
    this.updateUserTodo(utilisateur, code_question);

    if (
      !utilisateur.kyc_history.isQuestionAnsweredByCode(code_question) &&
      gain_points
    ) {
      const question =
        utilisateur.kyc_history.getUpToDateQuestionByCodeOrException(
          code_question,
        );
      utilisateur.gamification.ajoutePoints(question.points, utilisateur);
    }

    let updated_kyc;
    if (labels_reponse) {
      updated_kyc =
        utilisateur.kyc_history.updateQuestionByCodeWithLabelOrException(
          code_question,
          labels_reponse,
        );
    } else {
      updated_kyc = utilisateur.kyc_history.updateQuestionByCodeWithCode(
        code_question,
        code_reponse,
      );
    }
    utilisateur.kyc_history.synchroKYCAvecProfileUtilisateur(
      updated_kyc,
      utilisateur,
    );

    utilisateur.missions.answerKyc(code_question);

    this.dispatchKYCUpdateToOtherKYCsPostUpdate(code_question, utilisateur);

    utilisateur.recomputeRecoTags();
  }

  private updateUserTodo(utilisateur: Utilisateur, questionId: string) {
    const matching =
      utilisateur.parcours_todo.findTodoKYCOrMosaicElementByQuestionID(
        questionId,
      );
    if (matching && !matching.element.isDone()) {
      matching.todo.makeProgress(matching.element);
    }
  }

  private synchroAlimentationRegime(
    kyc: QuestionKYC,
    utilisateur: Utilisateur,
  ) {
    const code_reponse_unique = kyc.getCodeReponseUniqueSaisie();
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
