import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { Enchainement } from '../domain/kyc/enchainement';
import { KycToTags_v2 } from '../domain/kyc/synchro/kycToTagsV2';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ActionFilter } from '../infrastructure/repository/action.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterRepository } from '../infrastructure/repository/winter/winter.repository';
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
    private winterRepository: WinterRepository,
  ) {}

  public async getUtilisateurThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<DetailThematique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.thematique_history,
        Scope.recommandation,
        Scope.kyc,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const personnalisation_done_once =
      utilisateur.thematique_history.isPersonnalisationDoneOnce(thematique);

    const result = new DetailThematique();
    result.thematique = thematique;
    result.liste_actions = [];
    result.enchainement_questions_personnalisation =
      THEMATIQUE_ENCHAINEMENT_MAPPING[thematique];
    result.personnalisation_necessaire = !personnalisation_done_once;

    result.nom_commune = this.communeRepository.getLibelleCommuneLowerCase(
      utilisateur.logement.code_commune,
    );

    const thematique_synthese =
      await this.thematiqueBoardUsecase.external_thematique_synthese(
        thematique,
        utilisateur.logement.code_commune,
      );

    result.nombre_actions = thematique_synthese.nombre_actions;
    result.nombre_aides = thematique_synthese.nombre_aides;
    result.nombre_recettes = thematique_synthese.nombre_recettes;
    result.nombre_simulateurs = thematique_synthese.nombre_simulateurs;

    result.est_utilisateur_ngc = utilisateur.vientDeNGC();

    if (personnalisation_done_once) {
      result.liste_actions = await this.buildThematiquePostPersonnalisation(
        utilisateur,
        thematique,
      );

      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.thematique_history],
      );
    }

    return result;
  }

  private async buildThematiquePostPersonnalisation(
    utilisateur: Utilisateur,
    thematique?: Thematique,
  ): Promise<Action[]> {
    const history = utilisateur.thematique_history;

    const action_faites_par_utilisateur = history.getListeActionsFaites();
    const action_exclues = history.getAllTypeCodeActionsExclues();
    const total_a_exclure = action_exclues.concat(
      action_faites_par_utilisateur,
    );

    const stock_actions_eligibles =
      await this.getActionEligiblesEtRecommandeesUtilisateur(utilisateur, {
        type_codes_exclus: total_a_exclure,
        thematique: thematique,
      });

    const liste_actions = stock_actions_eligibles.slice(0, 6);

    for (const action of liste_actions) {
      action.deja_vue = utilisateur.thematique_history.isActionVue(action);
      action.deja_faite = utilisateur.thematique_history.isActionFaite(action);
      action.nombre_actions_faites =
        this.compteurActionsRepository.getNombreFaites(action);
    }

    return liste_actions;
  }

  public async removeAction(
    utilisateurId: string,
    code_action: string,
    type_action: TypeAction,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.recommandation, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);
    const action: TypeCodeAction = { type: type_action, code: code_action };

    utilisateur.thematique_history.exclureAction(action);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async remove6FirstActions(
    utilisateurId: string,
    thematique?: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.recommandation, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_actions = await this.buildThematiquePostPersonnalisation(
      utilisateur,
      thematique,
    );

    utilisateur.thematique_history.exclureManyActions(liste_actions);

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
      [
        Scope.thematique_history,
        Scope.kyc,
        Scope.gamification,
        Scope.recommandation,
        Scope.logement,
      ],
    );
    Utilisateur.checkState(utilisateur);

    if (
      !utilisateur.thematique_history.isPersonnalisationDoneOnce(thematique)
    ) {
      utilisateur.gamification.ajoutePoints(25, utilisateur);
    }
    utilisateur.thematique_history.declarePersonnalisationDoneOnce(thematique);

    new KycToTags_v2(
      utilisateur.kyc_history,
      utilisateur.recommandation,
      utilisateur.logement,
      this.communeRepository,
    ).refreshTagState();

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [
        Scope.thematique_history,
        Scope.gamification,
        Scope.core,
        Scope.recommandation,
      ],
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

  public async external_update_winter_recommandation(
    utilisateur: Utilisateur,
  ): Promise<TypeCodeAction[]> {
    if (!utilisateur.logement?.prm) {
      return [];
    }

    const new_reco_set: TypeCodeAction[] = [];

    const liste = await this.winterRepository.listerActionsWinter(
      utilisateur.id,
    );

    for (const winter_action of liste) {
      new_reco_set.push({
        code: winter_action.slug,
        type: TypeAction.classique,
      });
    }

    utilisateur.thematique_history.setWinterRecommandations(new_reco_set);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );

    return new_reco_set;
  }

  private async getActionEligiblesEtRecommandeesUtilisateur(
    utilisateur: Utilisateur,
    filtre: ActionFilter,
  ): Promise<Action[]> {
    let liste_actions = await this.actionUsecase.external_get_user_actions(
      utilisateur,
      filtre,
    );

    liste_actions =
      utilisateur.recommandation.trierEtFiltrerRecommandations(liste_actions);

    return liste_actions;
  }
}
