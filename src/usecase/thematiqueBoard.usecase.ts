import { Injectable } from '@nestjs/common';
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
      [],
    );
    Utilisateur.checkState(utilisateur);

    return await this.buildSyntheseFromCodeCommune(utilisateur.code_commune);
  }

  public async buildHomeBoard(utilisateurId: string): Promise<HomeBoard> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    const result = new HomeBoard();
    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.code_commune,
    );
    result.nom_commune = commune.nom;
    result.total_actions_faites =
      await this.compteurActionsRepository.getTotalFaites();

    result.total_utilisateur_actions_faites =
      utilisateur.thematique_history.getNombreActionsFaites();

    const recap_progression =
      this.bilanCarboneUsecase.external_build_enchainement_bilan_recap(
        utilisateur,
      );
    result.pourcentage_bilan_done =
      recap_progression.pourcentage_prog_totale_sans_mini_bilan;

    return result;
  }

  public async getListeThematiquesPrincipales(
    code_commune?: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    return await this.buildSyntheseFromCodeCommune(code_commune);
  }

  private async buildSyntheseFromCodeCommune(
    code_commune: string,
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
    );

    const logement = await this.external_thematique_synthese(
      Thematique.logement,
      code_commune,
    );
    const transport = await this.external_thematique_synthese(
      Thematique.transport,
      code_commune,
    );
    const consommation = await this.external_thematique_synthese(
      Thematique.consommation,
      code_commune,
    );

    result.thematiques.push(alimentation, logement, transport, consommation);

    return result;
  }

  public async external_thematique_synthese(
    thematique: Thematique,
    code_commune: string,
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
        ),
        nombre_recettes: undefined,
        nombre_simulateurs: 0,
      };
    }
    return undefined;
  }
}
