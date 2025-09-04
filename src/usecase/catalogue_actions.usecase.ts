import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import {
  CatalogueAction,
  Consultation,
  Ordre,
  Realisation,
  Recommandation,
} from '../domain/actions/catalogueAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { Selection } from '../domain/contenu/selection';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  ActionFilter,
  ActionRepository,
} from '../infrastructure/repository/action.repository';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import {
  Commune,
  CommuneRepository,
} from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { AidesUsecase } from './aides.usecase';

@Injectable()
export class CatalogueActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private aideRepository: AideRepository,
    private aidesUsecase: AidesUsecase,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async getCompteurActions(): Promise<number> {
    return await this.compteurActionsRepository.getTotalFaites();
  }

  async getOpenCatalogue(
    liste_thematiques: Thematique[],
    liste_selections: Selection[],
    code_commune: string = null,
    titre: string = undefined,
  ): Promise<CatalogueAction> {
    const liste_actions = await this.actionRepository.list({
      liste_thematiques:
        liste_thematiques.length > 0 ? liste_thematiques : undefined,
      liste_selections:
        liste_selections.length > 0 ? liste_selections : undefined,
      titre_fragment: titre,
    });

    let catalogue = new CatalogueAction();
    let commune: Commune;
    if (code_commune) {
      commune =
        this.communeRepository.getCommuneByCodeINSEESansArrondissement(
          code_commune,
        );
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }

      for (const action_def of liste_actions) {
        const count_aides = await this.aidesUsecase.external_count_aides(
          commune.code,
          commune.codesPostaux[0],
          undefined,
          action_def.besoins,
        );

        const action = new Action(action_def);
        action.nombre_aides = count_aides;
        catalogue.actions.push(action);
      }
    } else {
      for (const action_def of liste_actions) {
        const count_aides = await this.aideRepository.count({
          besoins: action_def.besoins,
          echelle: Echelle.National,
          date_expiration: new Date(),
        });
        const action = new Action(action_def);
        action.nombre_aides = count_aides;
        catalogue.actions.push(action);
      }
    }

    this.setFiltreThematiqueToCatalogue(catalogue, liste_thematiques);
    this.setFiltreSelectionToCatalogue(catalogue, liste_selections);

    for (const action of catalogue.actions) {
      this.setCompteurActionsEtLabel(action);
    }

    return catalogue;
  }

  async getCatalogueUtilisateur(
    utilisateurId: string,
    liste_thematiques: Thematique[],
    liste_selections: Selection[],
    titre: string = undefined,
    consultation: Consultation,
    realisation: Realisation,
    recommandation: Recommandation,
    ordre: Ordre,
    exclure_rejets_utilisateur: boolean,
    skip: number = 0,
    take: number = 1000000,
  ): Promise<CatalogueAction> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.logement, Scope.recommandation],
    );

    Utilisateur.checkState(utilisateur);
    return await this.external_get_utilisateur_catalogue(
      utilisateur,
      liste_thematiques,
      liste_selections,
      titre,
      consultation,
      realisation,
      recommandation,
      ordre,
      exclure_rejets_utilisateur,
      skip,
      take,
    );
  }

  async external_get_utilisateur_catalogue(
    utilisateur: Utilisateur,
    liste_thematiques: Thematique[],
    liste_selections: Selection[],
    titre: string = undefined,
    consultation: Consultation,
    realisation: Realisation,
    recommandation: Recommandation,
    ordre: Ordre,
    exclure_rejets_utilisateur: boolean,
    skip: number = 0,
    take: number = 1000000,
  ): Promise<CatalogueAction> {
    let catalogue = new CatalogueAction();

    const filtre: ActionFilter = {};

    filtre.recommandation = recommandation;
    filtre.realisation = realisation;
    filtre.consultation = consultation;
    filtre.exclure_rejets_utilisateur = exclure_rejets_utilisateur;

    filtre.liste_thematiques =
      liste_thematiques.length > 0 ? liste_thematiques : undefined;

    filtre.liste_selections =
      liste_selections.length > 0 ? liste_selections : undefined;

    filtre.titre_fragment = titre;

    // FIXME : à supprimer quand suppression de ordre dans l'API
    if (ordre === Ordre.recommandee_filtre_perso) {
      filtre.recommandation = Recommandation.recommandee_et_neutre;
      filtre.exclure_rejets_utilisateur = true;
    }
    if (ordre === Ordre.recommandee) {
      filtre.recommandation = Recommandation.recommandee;
    }

    catalogue.actions = await this.external_get_user_actions(
      utilisateur,
      filtre,
    );

    catalogue.consultation = consultation;
    catalogue.realisation = realisation;
    catalogue.recommandation = recommandation;

    this.setFiltreThematiqueToCatalogue(catalogue, liste_thematiques);
    this.setFiltreSelectionToCatalogue(catalogue, liste_selections);

    for (const action of catalogue.actions) {
      this.setCompteurActionsEtLabel(action);
    }

    this.setMontantEconomiesEuros(catalogue.actions, utilisateur);

    catalogue.setNombreResultatsDispo(catalogue.actions.length);

    catalogue.actions = catalogue.actions.slice(skip, skip + take);

    return catalogue;
  }

  public async external_get_user_actions(
    utilisateur: Utilisateur,
    filtre: ActionFilter,
  ): Promise<Action[]> {
    if (filtre.exclure_rejets_utilisateur) {
      filtre.type_codes_exclus =
        utilisateur.thematique_history.getAllTypeCodeActionsExclues();
    }

    const liste_actions = await this.actionRepository.list(filtre);

    let actions_resultat: Action[] = [];

    const liste_aides_utilisateur =
      await this.aidesUsecase.external_get_aides_utilisateur(
        utilisateur,
        undefined,
      );

    for (const action_def of liste_actions) {
      const action = new Action(action_def);
      action.nombre_aides = this.countAidesSurBesoins(
        action_def.besoins,
        liste_aides_utilisateur,
      );
      action.deja_vue = utilisateur.thematique_history.isActionVue(action);
      action.deja_faite = utilisateur.thematique_history.isActionFaite(action);
      actions_resultat.push(action);
    }

    utilisateur.thematique_history.tagguerActionRecommandeesDynamiquement(
      actions_resultat,
    );

    const filtered_reco_actions =
      utilisateur.recommandation.trierEtFiltrerRecommandations(
        actions_resultat,
      );

    if (filtre.recommandation === Recommandation.recommandee) {
      const new_action_set = [];
      for (const action of filtered_reco_actions) {
        if (action.score > 0) {
          new_action_set.push(action);
        }
      }
      actions_resultat = new_action_set;
    }
    if (filtre.recommandation === Recommandation.recommandee_et_neutre) {
      actions_resultat = filtered_reco_actions;
    }

    actions_resultat = this.filtreParConsultationRealisation(
      actions_resultat,
      filtre.consultation,
      filtre.realisation,
      utilisateur,
    );

    return actions_resultat;
  }

  async external_count_actions(thematique?: Thematique): Promise<number> {
    return await this.actionRepository.count({ thematique: thematique });
  }

  private setFiltreThematiqueToCatalogue(
    catalogue: CatalogueAction,
    liste_thematiques: Thematique[],
  ) {
    for (const thematique of ThematiqueRepository.getAllThematiques()) {
      if (thematique !== Thematique.services_societaux)
        catalogue.addSelectedThematique(
          thematique,
          liste_thematiques.includes(thematique),
        );
    }
  }

  private setFiltreSelectionToCatalogue(
    catalogue: CatalogueAction,
    liste_selections: Selection[],
  ) {
    for (const selection of Object.values(Selection)) {
      catalogue.addSelectedSelection(
        selection,
        liste_selections.includes(selection),
      );
    }
  }

  private filtreParConsultationRealisation(
    liste_actions: Action[],
    type_consulation: Consultation,
    type_realisation: Realisation,
    utilisateur: Utilisateur,
  ): Action[] {
    const new_action_list: Action[] = [];

    const prendre_vues = type_consulation === Consultation.vu;
    const prendre_faites = type_realisation === Realisation.faite;

    for (const action of liste_actions) {
      const est_vue = utilisateur.thematique_history.isActionVue(action);
      const est_faite = utilisateur.thematique_history.isActionFaite(action);

      const critere_vue =
        !type_consulation ||
        type_consulation === Consultation.tout ||
        (est_vue && prendre_vues) ||
        (!est_vue && !prendre_vues);

      const critere_fait =
        !type_realisation ||
        type_realisation === Realisation.tout ||
        (est_faite && prendre_faites) ||
        (!est_faite && !prendre_faites);

      if (critere_fait && critere_vue) {
        new_action_list.push(action);
      }
    }
    return new_action_list;
  }

  private setMontantEconomiesEuros(
    action_liste: Action[],
    utilisateur: Utilisateur,
  ) {
    for (const action of action_liste) {
      const reco_winter =
        utilisateur.thematique_history.getWinterRecommandation(action);
      if (reco_winter) {
        action.montant_max_economies_euros = reco_winter.montant_economies_euro;
      }
    }
  }

  private setCompteurActionsEtLabel(action: Action) {
    const nbr_faites = this.compteurActionsRepository.getNombreFaites(action);
    action.nombre_actions_faites = nbr_faites;
    action.label_compteur = action.label_compteur.replace(
      '{NBR_ACTIONS}',
      '' + nbr_faites,
    );
  }

  private countAidesSurBesoins(
    besoins: string[],
    aides: AideDefinition[],
  ): number {
    let counter = 0;
    for (const aide of aides) {
      if (besoins.includes(aide.besoin)) {
        counter++;
      }
    }
    return counter;
  }
}
