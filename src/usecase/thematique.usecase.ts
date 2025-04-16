import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { Enchainement } from '../domain/kyc/enchainement';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ActionFilter } from '../infrastructure/repository/action.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';
import { ThematiqueBoardUsecase } from './thematiqueBoard.usecase';

const THEMATIQUE_ENCHAINEMENT_MAPPING: { [key in Thematique]?: Enchainement } =
  {
    alimentation: Enchainement.ENCHAINEMENT_KYC_personnalisation_alimentation,
    consommation: Enchainement.ENCHAINEMENT_KYC_personnalisation_consommation,
    logement: Enchainement.ENCHAINEMENT_KYC_personnalisation_logement,
    transport: Enchainement.ENCHAINEMENT_KYC_personnalisation_transport,
  };

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private thematiqueBoardUsecase: ThematiqueBoardUsecase,
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

    const personnalisation_done =
      utilisateur.thematique_history.isPersonnalisationDone(thematique);

    const result = new DetailThematique();
    result.thematique = thematique;
    result.liste_actions = [];
    result.enchainement_questions_personnalisation =
      THEMATIQUE_ENCHAINEMENT_MAPPING[thematique];
    result.personnalisation_necessaire = !personnalisation_done;

    result.nom_commune = this.communeRepository.getLibelleCommuneLowerCase(
      utilisateur.code_commune,
    );

    const detailThematique =
      await this.thematiqueBoardUsecase.external_thematique_synthese(
        thematique,
        utilisateur.code_commune,
      );

    result.nombre_actions = detailThematique.nombre_actions;
    result.nombre_aides = detailThematique.nombre_aides;
    result.nombre_recettes = detailThematique.nombre_recettes;
    result.nombre_simulateurs = detailThematique.nombre_simulateurs;

    if (personnalisation_done) {
      await this.buildThematiquePostPersonnalisation(result, utilisateur);

      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.thematique_history],
      );
    }

    return result;
  }

  private async buildThematiquePostPersonnalisation(
    detailThematique: DetailThematique,
    utilisateur: Utilisateur,
  ): Promise<void> {
    const thema = detailThematique.thematique;
    const history = utilisateur.thematique_history;

    const stock_actions_eligibles = await this.getActionEligiblesUtilisateur(
      utilisateur,
      {
        type_codes_exclus: history.getActionsExclues(thema),
        thematique: thema,
      },
    );

    if (history.existeDesPropositions(thema)) {
      this.refreshActionProposeesWhenMissingInCMS(
        utilisateur,
        thema,
        stock_actions_eligibles,
      );

      for (const action_proposee of history.getActionsProposees(thema)) {
        const action_cible = stock_actions_eligibles.find((a) =>
          a.equals(action_proposee),
        );
        if (action_cible) {
          // Pas de raison de ne pas exister suite au 'refreshActionProposeesWhenMissingInCMS'
          detailThematique.liste_actions.push(action_cible);
        }
      }
    } else {
      detailThematique.liste_actions = stock_actions_eligibles.slice(0, 6);
      history.setActionsProposees(thema, detailThematique.liste_actions);
    }

    for (const action of detailThematique.liste_actions) {
      action.deja_vue = utilisateur.thematique_history.isActionVue(action);
      action.deja_faite = utilisateur.thematique_history.isActionFaite(action);
      action.nombre_actions_faites =
        this.compteurActionsRepository.getNombreFaites(action);
    }
  }

  public async removeAction(
    utilisateurId: string,
    thema: Thematique,
    code_action: string,
    type_action: TypeAction,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);
    const action: TypeCodeAction = { type: type_action, code: code_action };

    await this.external_remove_action_from_reco_perso(
      thema,
      action,
      utilisateur,
    );

    utilisateur.thematique_history.exclureAction(thema, action);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async external_remove_action_from_reco_perso(
    thema: Thematique,
    action_to_remove: TypeCodeAction,
    utilisateur: Utilisateur,
  ) {
    const history = utilisateur.thematique_history;

    if (history.doesActionsProposeesInclude(thema, action_to_remove)) {
      const new_action_list = await this.getActionEligiblesUtilisateur(
        utilisateur,
        {
          thematique: thema,
          type_codes_exclus: history
            .getActionsProposees(thema)
            .concat(history.getActionsExclues(thema)),
        },
      );
      if (new_action_list.length === 0) {
        history.removeActionAndShift(thema, action_to_remove);
      } else {
        const new_action = new_action_list[0];
        history.switchAction(thema, action_to_remove, new_action);
      }
    }
  }

  public async declarePersonnalisationOK(
    utilisateurId: string,
    thematique: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.kyc, Scope.gamification],
    );
    Utilisateur.checkState(utilisateur);

    if (
      !utilisateur.thematique_history.isPersonnalisationDoneOnce(thematique)
    ) {
      utilisateur.gamification.ajoutePoints(25, utilisateur);
    }
    utilisateur.thematique_history.declarePersonnalisationDone(thematique);

    utilisateur.thematique_history.recomputeTagExcluant(
      utilisateur.kyc_history,
    );

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history, Scope.gamification, Scope.core],
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

  private refreshActionProposeesWhenMissingInCMS(
    utilisateur: Utilisateur,
    thematique: Thematique,
    nouvelles_actions: Action[],
  ) {
    const nouvelles_actions_copy = [].concat(nouvelles_actions);
    const actions_proposees_depart = [].concat(
      utilisateur.thematique_history.getActionsProposees(thematique),
    );

    for (const action_depart of actions_proposees_depart) {
      const matching_action = nouvelles_actions.find((a) =>
        a.equals(action_depart),
      );

      if (!matching_action) {
        utilisateur.thematique_history.removeActionAndShift(
          thematique,
          action_depart,
        );
        const new_action = this.getFirstNewActionInListAndShiftActionList(
          actions_proposees_depart,
          nouvelles_actions_copy,
        );
        if (new_action) {
          utilisateur.thematique_history.appendAction(thematique, new_action);
        }
      }
    }
  }

  private getFirstNewActionInListAndShiftActionList(
    old_actions: TypeCodeAction[],
    liste_action_to_shift: Action[],
  ): Action {
    while (liste_action_to_shift.length > 0) {
      const candidate = liste_action_to_shift.shift();
      const found = old_actions.find((a) => candidate.equals(a));
      if (!found) {
        return candidate;
      }
    }
    return undefined;
  }

  private async getActionEligiblesUtilisateur(
    utilisateur: Utilisateur,
    filtre: ActionFilter,
  ): Promise<Action[]> {
    const result: Action[] = [];

    const liste_actions = await this.actionUsecase.external_get_user_actions(
      utilisateur,
      filtre,
    );

    const tag_excluants =
      utilisateur.thematique_history.getListeTagsExcluants();

    for (const action of liste_actions) {
      if (!this.hasIntersect(action.tags_excluants, tag_excluants)) {
        result.push(action);
      }
    }
    return result;
  }

  private hasIntersect(array_1: any[], array_2: any[]): boolean {
    return array_1.some((v) => array_2.indexOf(v) !== -1);
  }
}
