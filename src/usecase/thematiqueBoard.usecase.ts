import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import {
  EnchainementDefinition,
  EnchainementType,
} from '../domain/kyc/enchainementDefinition';
import { Progression } from '../domain/kyc/Progression';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { HomeBoard } from '../domain/thematique/homeBoard';
import { Thematique } from '../domain/thematique/thematique';
import { ThematiqueSynthese } from '../domain/thematique/thematiqueSynthese';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';
import { AidesUsecase } from './aides.usecase';
import { BilanCarboneUsecase } from './bilanCarbone.usecase';

@Injectable()
export class ThematiqueBoardUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private aidesUsecase: AidesUsecase,
    private bilanCarboneUsecase: BilanCarboneUsecase,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private compteurActionsRepository: CompteurActionsRepository,
  ) {}

  public async getUtilisateurListeThematiquesPrincipales(
    utilisateurId: string,
  ): Promise<{
    nom_commune: string;
    thematiques: ThematiqueSynthese[];
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    return await this.buildSyntheseFromCodeCommune(
      utilisateur.logement.code_commune,
      utilisateur.logement.code_postal,
    );
  }

  public async buildHomeBoard(utilisateurId: string): Promise<HomeBoard> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.thematique_history,
        Scope.kyc,
        Scope.cache_bilan_carbone,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    if (!utilisateur.isOnboardingDone() && App.isForceOnboarding()) {
      ApplicationError.throwOnboardingNotDone();
    }

    const result = new HomeBoard();
    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.logement.code_commune,
    );
    result.nom_commune = commune?.nom;
    result.est_utilisateur_ngc = utilisateur.vientDeNGC();

    result.total_actions_faites =
      await this.compteurActionsRepository.getTotalFaites();

    result.total_utilisateur_actions_faites =
      utilisateur.thematique_history.getNombreActionsFaites();

    const total_CO2_kg =
      await this.bilanCarboneUsecase.external_bilan_valeur_total(utilisateur);
    result.bilan_carbone_total_kg = total_CO2_kg;

    const recap_progression =
      this.bilanCarboneUsecase.external_build_enchainement_bilan_recap(
        utilisateur,
      );

    result.pourcentage_bilan_done =
      recap_progression.pourcentage_prog_totale_sans_mini_bilan;

    let transport_reco = utilisateur.kyc_history.getEnchainementKYCsEligibles(
      EnchainementDefinition[
        EnchainementType.ENCHAINEMENT_KYC_personnalisation_transport
      ],
    );
    let logement_reco = utilisateur.kyc_history.getEnchainementKYCsEligibles(
      EnchainementDefinition[
        EnchainementType.ENCHAINEMENT_KYC_personnalisation_logement
      ],
    );
    let conso_reco = utilisateur.kyc_history.getEnchainementKYCsEligibles(
      EnchainementDefinition[
        EnchainementType.ENCHAINEMENT_KYC_personnalisation_consommation
      ],
    );
    let alimentation_reco =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        EnchainementDefinition[
          EnchainementType.ENCHAINEMENT_KYC_personnalisation_alimentation
        ],
      );

    const alimentation_progression =
      QuestionKYC.getProgression(alimentation_reco);

    const consommation_progression = QuestionKYC.getProgression(conso_reco);

    const logement_progression = QuestionKYC.getProgression(logement_reco);

    const transport_progression = QuestionKYC.getProgression(transport_reco);

    result.pourcentage_global_reco_done = Progression.getPourcentOfList([
      alimentation_progression,
      consommation_progression,
      logement_progression,
      transport_progression,
    ]);
    result.pourcentage_alimentation_reco_done =
      alimentation_progression.getPourcent();
    result.pourcentage_consommation_reco_done =
      consommation_progression.getPourcent();
    result.pourcentage_logement_reco_done = logement_progression.getPourcent();
    result.pourcentage_transport_reco_done =
      transport_progression.getPourcent();

    const nombre_aides = await this.aidesUsecase.external_count_aides(
      undefined,
      utilisateur.logement.code_commune,
      utilisateur.logement.code_postal,
    );
    result.nombre_aides = nombre_aides;
    result.nombre_recettes = 1150;

    return result;
  }

  public async getListeThematiquesPrincipales(
    code_commune?: string,
    code_postal?: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    return await this.buildSyntheseFromCodeCommune(code_commune, code_postal);
  }

  private async buildSyntheseFromCodeCommune(
    code_commune: string,
    code_postal: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    const result: { nom_commune: string; thematiques: ThematiqueSynthese[] } = {
      nom_commune: undefined,
      thematiques: [],
    };

    if (code_commune) {
      const commune =
        this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
      result.nom_commune = commune.nom;
    }

    const alimentation = await this.external_thematique_synthese(
      Thematique.alimentation,
      code_commune,
      code_postal,
    );

    const logement = await this.external_thematique_synthese(
      Thematique.logement,
      code_commune,
      code_postal,
    );
    const transport = await this.external_thematique_synthese(
      Thematique.transport,
      code_commune,
      code_postal,
    );
    const consommation = await this.external_thematique_synthese(
      Thematique.consommation,
      code_commune,
      code_postal,
    );

    result.thematiques.push(alimentation, logement, transport, consommation);

    return result;
  }

  public async external_thematique_synthese(
    thematique: Thematique,
    code_commune: string,
    code_postal: string,
  ): Promise<ThematiqueSynthese> {
    if (thematique === Thematique.alimentation) {
      return {
        thematique: Thematique.alimentation,
        nombre_actions: await this.actionUsecase.external_count_actions(
          Thematique.alimentation,
        ),
        nombre_aides: await this.aidesUsecase.external_count_aides(
          Thematique.alimentation,
          code_commune,
          code_postal,
        ),
        nombre_recettes: 1150,
        nombre_simulateurs: 0,
      };
    }
    if (thematique === Thematique.logement) {
      return {
        thematique: Thematique.logement,
        nombre_actions: await this.actionUsecase.external_count_actions(
          Thematique.logement,
        ),
        nombre_aides: await this.aidesUsecase.external_count_aides(
          Thematique.logement,
          code_commune,
          code_postal,
        ),
        nombre_recettes: undefined,
        nombre_simulateurs: 0,
      };
    }
    if (thematique === Thematique.transport) {
      return {
        thematique: Thematique.transport,
        nombre_actions: await this.actionUsecase.external_count_actions(
          Thematique.transport,
        ),
        nombre_aides: await this.aidesUsecase.external_count_aides(
          Thematique.transport,
          code_commune,
          code_postal,
        ),
        nombre_recettes: undefined,
        nombre_simulateurs: 0,
      };
    }
    if (thematique === Thematique.consommation) {
      return {
        thematique: Thematique.consommation,
        nombre_actions: await this.actionUsecase.external_count_actions(
          Thematique.consommation,
        ),
        nombre_aides: await this.aidesUsecase.external_count_aides(
          Thematique.consommation,
          code_commune,
          code_postal,
        ),
        nombre_recettes: undefined,
        nombre_simulateurs: 0,
      };
    }
    return undefined;
  }
}
