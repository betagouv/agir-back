import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { Realisation, Recommandation } from '../domain/actions/catalogueAction';
import { TypeAction } from '../domain/actions/typeAction';
import { EnchainementType } from '../domain/kyc/enchainementDefinition';
import { KycToTags_v2 } from '../domain/scoring/system_v2/kycToTagsV2';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { RisquesNaturelsCommunesRepository } from '../infrastructure/repository/risquesNaturelsCommunes.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { CatalogueActionUsecase } from './catalogue_actions.usecase';
import { ThematiqueBoardUsecase } from './thematiqueBoard.usecase';

const THEMATIQUE_ENCHAINEMENT_MAPPING: {
  [key in Thematique]?: EnchainementType;
} = {
  alimentation: EnchainementType.ENCHAINEMENT_KYC_personnalisation_alimentation,
  consommation: EnchainementType.ENCHAINEMENT_KYC_personnalisation_consommation,
  logement: EnchainementType.ENCHAINEMENT_KYC_personnalisation_logement,
  transport: EnchainementType.ENCHAINEMENT_KYC_personnalisation_transport,
};

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private catalogueActionUsecase: CatalogueActionUsecase,
    private utilisateurRepository: UtilisateurRepository,
    private communeRepository: CommuneRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private thematiqueBoardUsecase: ThematiqueBoardUsecase,
    private risquesNaturelsCommunesRepository: RisquesNaturelsCommunesRepository,
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
        utilisateur.logement.code_postal,
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
    let stock_actions_eligibles =
      await this.catalogueActionUsecase.external_get_user_actions(utilisateur, {
        thematique: thematique,
        recommandation: Recommandation.recommandee_et_neutre,
        realisation: Realisation.pas_faite,
        exclure_rejets_utilisateur: true,
      });

    const liste_actions = stock_actions_eligibles.slice(0, 6);

    for (const action of liste_actions) {
      this.setCompteurActionsEtLabel(action);
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
      utilisateur.logement,
      this.communeRepository,
      this.risquesNaturelsCommunesRepository,
    ).refreshTagState_v2(utilisateur.recommandation);

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

  private setCompteurActionsEtLabel(action: Action) {
    const nbr_faites = this.compteurActionsRepository.getNombreFaites(action);
    action.nombre_actions_faites = nbr_faites;
    action.label_compteur = action.label_compteur.replace(
      '{NBR_ACTIONS}',
      '' + nbr_faites,
    );
  }
}
