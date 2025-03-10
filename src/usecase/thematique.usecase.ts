import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ActionFilter } from '../infrastructure/repository/action.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';
import { Enchainement } from './questionKYC.usecase';
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
    detail_a_remplir: DetailThematique,
    utilisateur: Utilisateur,
  ): Promise<void> {
    let actions: Action[];
    const thema = detail_a_remplir.thematique;
    const history = utilisateur.thematique_history;

    if (history.existeDesPropositions(thema)) {
      actions = await this.getActionEligiblesUtilisateur(utilisateur, {
        type_codes_inclus: history.getActionsProposees(thema),
      });
      for (const action_proposee of history.getActionsProposees(thema)) {
        const action_cible = actions.find((a) => a.equals(action_proposee));
        if (action_cible) {
          detail_a_remplir.liste_actions.push(action_cible);
        }
      }
    } else {
      actions = await this.getActionEligiblesUtilisateur(utilisateur, {
        thematique: thema,
        type_codes_exclus: history.getActionsExclues(thema),
      });
      detail_a_remplir.liste_actions = actions.slice(0, 6);
      history.setActionsProposees(thema, detail_a_remplir.liste_actions);
    }

    for (const action of actions) {
      action.deja_vue = utilisateur.thematique_history.isActionVue(
        action.getTypeCode(),
      );
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
    const type_code: TypeCodeAction = { type: type_action, code: code_action };
    const history = utilisateur.thematique_history;

    if (history.doesActionsProposeesInclude(thema, type_code)) {
      history.exclureAction(thema, type_code);

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
        history.removeActionAndShift(thema, type_code);
      } else {
        const new_action = new_action_list[0];
        history.switchAction(thema, type_code, new_action.getTypeCode());
      }
    } else {
      history.exclureAction(thema, type_code);
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
      [Scope.thematique_history, Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.thematique_history.declarePersonnalisationDone(thematique);

    utilisateur.thematique_history.recomputeTagExcluant(
      utilisateur.kyc_history,
    );

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
