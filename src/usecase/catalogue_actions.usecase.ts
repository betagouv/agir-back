import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { ACTION_BILAN_MAPPING_ENCHAINEMENTS } from '../domain/actions/actionBilanMappingEnchainements';
import {
  CatalogueAction,
  Consultation,
  Ordre,
  Realisation,
} from '../domain/actions/catalogueAction';
import { ActionBilanID, TypeAction } from '../domain/actions/typeAction';
import { Echelle } from '../domain/aides/echelle';
import { Selection } from '../domain/contenu/selection';
import { EnchainementDefinition } from '../domain/kyc/enchainementDefinition';
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

@Injectable()
export class CatalogueActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async getCompteurActions(): Promise<number> {
    return await this.compteurActionsRepository.getTotalFaites();
  }

  async getOpenCatalogue(
    filtre_thematiques: Thematique[],
    code_commune: string = null,
    titre: string = undefined,
  ): Promise<CatalogueAction> {
    const liste_actions = await this.actionRepository.list({
      liste_thematiques:
        filtre_thematiques.length > 0 ? filtre_thematiques : undefined,
      titre_fragment: titre,
    });

    let catalogue = new CatalogueAction();
    let commune: Commune;
    if (code_commune) {
      commune = this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }

      for (const action_def of liste_actions) {
        const count_aides = await this.aideRepository.count({
          besoins: action_def.besoins,
          code_postal: commune.codesPostaux[0],
          code_commune: commune.code,
          code_departement: commune.departement,
          code_region: commune.region,
          date_expiration: new Date(),
        });
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

    this.setFiltreThematiqueToCatalogue(catalogue, filtre_thematiques);

    for (const action of catalogue.actions) {
      this.setCompteurActionsEtLabel(action);
    }

    return catalogue;
  }

  async getUtilisateurCatalogue(
    utilisateurId: string,
    liste_thematiques: Thematique[],
    liste_selections: Selection[],
    titre: string = undefined,
    consultation: Consultation,
    realisation: Realisation,
    ordre: Ordre,
    skip: number = 0,
    take: number = 1000000,
  ): Promise<CatalogueAction> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.logement, Scope.recommandation],
    );
    Utilisateur.checkState(utilisateur);

    let catalogue = new CatalogueAction();

    const filtre: ActionFilter = {};
    if (ordre === Ordre.recommandee_filtre_perso) {
      filtre.type_codes_exclus =
        utilisateur.thematique_history.getAllTypeCodeActionsExclues();
    }
    filtre.ordre = ordre;

    filtre.liste_thematiques =
      liste_thematiques.length > 0 ? liste_thematiques : undefined;

    filtre.liste_selections =
      liste_selections.length > 0 ? liste_selections : undefined;

    filtre.titre_fragment = titre;

    catalogue.actions = await this.external_get_user_actions(
      utilisateur,
      filtre,
    );

    this.setFiltreThematiqueToCatalogue(catalogue, liste_thematiques);
    this.setFiltreSelectionToCatalogue(catalogue, liste_selections);

    this.filtreParConsultationRealisation(
      catalogue,
      consultation,
      realisation,
      utilisateur,
    );

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
    const liste_actions = await this.actionRepository.list(filtre);

    let result: Action[] = [];
    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.logement.code_commune,
    );

    for (const action_def of liste_actions) {
      const count_aides = await this.aideRepository.count({
        besoins: action_def.besoins,
        code_postal: commune.codesPostaux[0],
        code_commune: commune.code,
        code_departement: commune.departement,
        code_region: commune.region,
        date_expiration: new Date(),
      });
      const action = new Action(action_def);
      action.nombre_aides = count_aides;
      action.deja_vue = utilisateur.thematique_history.isActionVue(action);
      action.deja_faite = utilisateur.thematique_history.isActionFaite(action);
      result.push(action);
    }

    if (filtre.ordre === Ordre.recommandee) {
      utilisateur.thematique_history.tagguerActionRecommandeesDynamiquement(
        result,
      );
      result = utilisateur.recommandation.trierEtFiltrerRecommandations(result);
    }

    return result;
  }

  public external_get_kyc_codes_from_action_bilan(
    code_action: string,
  ): string[] {
    const enchainement_id =
      ACTION_BILAN_MAPPING_ENCHAINEMENTS[ActionBilanID[code_action]];

    if (enchainement_id) {
      return EnchainementDefinition[enchainement_id];
    } else {
      const action_def = this.actionRepository.getActionDefinitionByTypeCode({
        type: TypeAction.bilan,
        code: code_action,
      });
      return action_def ? action_def.kyc_codes : [];
    }
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
    catalogue: CatalogueAction,
    type_consulation: Consultation,
    type_realisation: Realisation,
    utilisateur: Utilisateur,
  ) {
    catalogue.consultation = type_consulation;
    catalogue.realisation = type_realisation;

    const new_action_list: Action[] = [];

    const prendre_vues = type_consulation === Consultation.vu;
    const prendre_faites = type_realisation === Realisation.faite;

    for (const action of catalogue.actions) {
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
    catalogue.actions = new_action_list;
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
}
