import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { Enchainement } from '../domain/kyc/questionKYC';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { ThematiqueSynthese } from '../domain/thematique/thematiqueSynthese';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';
import { AidesUsecase } from './aides.usecase';

const THEMATIQUE_ENCHAINEMENT_MAPPING: Record<Thematique, Enchainement> = {
  alimentation: Enchainement.ENCHAINEMENT_KYC_bilan_alimentation,
  consommation: Enchainement.ENCHAINEMENT_KYC_bilan_consommation,
  logement: Enchainement.ENCHAINEMENT_KYC_bilan_logement,
  transport: Enchainement.ENCHAINEMENT_KYC_bilan_transport,
  climat: Enchainement.ENCHAINEMENT_KYC_1,
  dechet: Enchainement.ENCHAINEMENT_KYC_1,
  loisir: Enchainement.ENCHAINEMENT_KYC_1,
  services_societaux: Enchainement.ENCHAINEMENT_KYC_1,
};

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private aidesUsecase: AidesUsecase,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  public async getUtilisateurThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<DetailThematique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const result = new DetailThematique();
    const enchainement_id = THEMATIQUE_ENCHAINEMENT_MAPPING[thematique];

    const personnalisation_done =
      utilisateur.thematique_history.isPersonnalisationDone(thematique);

    result.enchainement_questions_personnalisation = enchainement_id;
    result.thematique = thematique;
    result.personnalisation_necessaire = !personnalisation_done;
    result.liste_actions = [];

    if (!personnalisation_done) {
      return result;
    }

    if (utilisateur.thematique_history.plusDeSuggestionsDispo(thematique)) {
      return result;
    }

    let actions: Action[];
    if (
      utilisateur.thematique_history.getNombreActionProposees(thematique) === 0
    ) {
      actions = await this.actionUsecase.internal_get_user_actions(
        utilisateur,
        { thematique: thematique },
      );
      actions = actions.slice(0, 6);
      utilisateur.thematique_history.setActionsProposees(thematique, actions);
    } else {
      actions = await this.actionUsecase.internal_get_user_actions(
        utilisateur,
        {
          type_codes_inclus:
            utilisateur.thematique_history.getActionsProposees(thematique),
        },
      );
    }

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );

    actions = actions.slice(0, 6);
    result.liste_actions = actions;

    return result;
  }

  public async removeAction(
    utilisateurId: string,
    thematique: Thematique,
    code_action: string,
    type_action: TypeAction,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const type_code: TypeCodeAction = { type: type_action, code: code_action };

    if (
      utilisateur.thematique_history.doesActionsProposeesInclude(
        thematique,
        type_code,
      )
    ) {
      const new_action_list =
        await this.actionUsecase.internal_get_user_actions(utilisateur, {
          thematique: thematique,
          type_codes_exclus:
            utilisateur.thematique_history.getActionsProposees(thematique),
        });
      if (new_action_list.length === 0) {
        utilisateur.thematique_history.removeActionAndShift(
          thematique,
          type_code,
        );
      } else {
        const new_action = new_action_list[0];
        utilisateur.thematique_history.switchAction(
          thematique,
          type_code,
          new_action.getTypeCode(),
        );
      }
    } else {
      utilisateur.thematique_history.addActionToExclusionList(
        thematique,
        type_code,
      );
    }

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async declarePersonnalisationOK(
    utilisateurId: string,
    thematique: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.thematique_history.declarePersonnalisationDone(thematique);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async resetPersonnalisation(
    utilisateurId: string,
    thematique: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.thematique_history.resetPersonnalisation(thematique);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

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

    const alimentation: ThematiqueSynthese = {
      thematique: Thematique.alimentation,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.alimentation,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.alimentation,
        code_commune,
      ),
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
    };

    const logement: ThematiqueSynthese = {
      thematique: Thematique.logement,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.logement,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.logement,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const transport: ThematiqueSynthese = {
      thematique: Thematique.transport,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.transport,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.transport,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const consommation: ThematiqueSynthese = {
      thematique: Thematique.consommation,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.consommation,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.consommation,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };

    result.thematiques.push(alimentation, logement, transport, consommation);

    return result;
  }
}
