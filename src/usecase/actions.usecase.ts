import { Injectable } from '@nestjs/common';
import { Action, ActionService } from '../domain/actions/action';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import {
  CatalogueAction,
  Consultation,
} from '../domain/actions/catalogueAction';
import { TypeAction } from '../domain/actions/typeAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { ServiceRechercheID } from '../domain/bibliotheque_services/recherche/serviceRechercheID';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
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
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BibliothequeUsecase } from './bibliotheque.usecase';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private bibliothequeUsecase: BibliothequeUsecase,
    private fAQRepository: FAQRepository,
    private personnalisator: Personnalisator,
  ) {}

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
      action.nombre_actions_faites =
        this.compteurActionsRepository.getNombreFaites(action);
    }

    return catalogue;
  }

  async getUtilisateurCatalogue(
    utilisateurId: string,
    filtre_thematiques: Thematique[],
    titre: string = undefined,
    consultation: Consultation = Consultation.tout,
  ): Promise<CatalogueAction> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    let catalogue = new CatalogueAction();

    catalogue.actions = await this.external_get_user_actions(utilisateur, {
      liste_thematiques:
        filtre_thematiques.length > 0 ? filtre_thematiques : undefined,
      titre_fragment: titre,
    });

    this.setFiltreThematiqueToCatalogue(catalogue, filtre_thematiques);

    this.filtreParConsultation(catalogue, consultation, utilisateur);

    for (const action of catalogue.actions) {
      action.nombre_actions_faites =
        this.compteurActionsRepository.getNombreFaites(action);
    }

    return catalogue;
  }

  async getAction(
    code: string,
    type: TypeAction,
    code_commune: string,
  ): Promise<Action> {
    const action_def = await this.actionRepository.getByCodeAndType(code, type);

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }

    const action = new Action(action_def);

    let commune: Commune;
    if (code_commune) {
      commune = this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
      action.nom_commune = commune.nom;
    }

    let linked_aides: AideDefinition[];
    if (commune) {
      linked_aides = await this.aideRepository.search({
        besoins: action_def.besoins,
        code_postal: commune.codesPostaux[0],
        code_commune: commune.code,
        code_departement: commune.departement,
        code_region: commune.region,
        date_expiration: new Date(),
      });
    } else {
      linked_aides = await this.aideRepository.search({
        besoins: action_def.besoins,
        echelle: Echelle.National,
        date_expiration: new Date(),
      });
    }

    const liste_services: ActionService[] = [];
    if (action_def.recette_categorie) {
      liste_services.push({
        categorie: action_def.recette_categorie,
        recherche_service_id: ServiceRechercheID.recettes,
      });
    }
    if (action_def.lvo_action) {
      liste_services.push({
        categorie: action_def.lvo_action,
        recherche_service_id: ServiceRechercheID.longue_vie_objets,
      });
    }

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }

    action.setListeAides(linked_aides);
    action.services = liste_services;

    const nbr_faites = this.compteurActionsRepository.getNombreFaites(action);
    action.nombre_actions_faites = nbr_faites;

    action.label_compteur = action.label_compteur.replace(
      '{NBR_ACTIONS}',
      '' + nbr_faites,
    );

    return this.personnalisator.personnaliser(action, undefined, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  async faireAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [
        Scope.thematique_history,
        Scope.gamification,
        Scope.history_article_quizz_aides,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = this.actionRepository.getActionDefinitionByTypeCode({
      type: type,
      code: code,
    });

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }
    if (!utilisateur.thematique_history.isActionFaite(action_def)) {
      await this.compteurActionsRepository.incrementFaite(action_def);

      const points = ActionDefinition.getNombrePointsOfTypeAction(
        action_def.type,
      );

      if (action_def.type === TypeAction.quizz) {
        const score = await this.external_calcul_score_quizz_action(
          action_def,
          utilisateur,
        );
        if (score.nombre_quizz_done !== action_def.quizz_ids.length) {
          ApplicationError.throwQuizzPasTermine(code);
        }
        if (score.nombre_bonnes_reponses / score.nombre_quizz_done < 0.666) {
          ApplicationError.throwQuizzPasTerminable(code);
        }
      }
      utilisateur.gamification.ajoutePoints(points, utilisateur);

      utilisateur.thematique_history.setActionCommeFaite(action_def);

      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.thematique_history, Scope.gamification, Scope.core],
      );
    }
  }

  async getUtilisateurAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
  ): Promise<Action> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = await this.actionRepository.getByCodeAndType(code, type);

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }

    const action = new Action(action_def);

    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.code_commune,
    );
    action.nom_commune = commune.nom;

    const linked_aides = await this.aideRepository.search({
      besoins: action_def.besoins,
      code_postal: commune.codesPostaux[0],
      code_commune: commune.code,
      code_departement: commune.departement,
      code_region: commune.region,
      date_expiration: new Date(),
    });

    const liste_services: ActionService[] = [];
    if (action_def.recette_categorie) {
      liste_services.push({
        categorie: action_def.recette_categorie,
        recherche_service_id: ServiceRechercheID.recettes,
      });
    }
    if (action_def.lvo_action) {
      liste_services.push({
        categorie: action_def.lvo_action,
        recherche_service_id: ServiceRechercheID.longue_vie_objets,
      });
    }

    action.setListeAides(linked_aides);
    action.services = liste_services;

    action.quizz_liste = [];
    for (const quizz_id of action_def.quizz_ids) {
      const quizz = await this.bibliothequeUsecase.external_get_quizz(quizz_id);
      action.quizz_liste.push(quizz);
    }

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }

    action.kycs = utilisateur.kyc_history.getEnchainementKYCsEligibles(
      action_def.kyc_codes,
    );

    action.deja_vue = utilisateur.thematique_history.isActionVue(action);
    action.deja_faite = utilisateur.thematique_history.isActionFaite(action);
    const nbr_faites = this.compteurActionsRepository.getNombreFaites(action);
    action.nombre_actions_faites = nbr_faites;
    action.label_compteur = action.label_compteur.replace(
      '{NBR_ACTIONS}',
      '' + nbr_faites,
    );

    utilisateur.thematique_history.setActionCommeVue(action);

    await this.compteurActionsRepository.incrementVue(action);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );

    return this.personnalisator.personnaliser(action, undefined, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  public async calculeScoreQuizzAction(
    utilisateurId: string,
    code_action_quizz: string,
  ): Promise<{ nombre_quizz_done: number; nombre_bonnes_reponses: number }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = await this.actionRepository.getByCodeAndType(
      code_action_quizz,
      TypeAction.quizz,
    );
    if (!action_def) {
      ApplicationError.throwActionNotFound(code_action_quizz, TypeAction.quizz);
    }

    return this.external_calcul_score_quizz_action(action_def, utilisateur);
  }

  async external_calcul_score_quizz_action(
    action: ActionDefinition,
    utilisateur: Utilisateur,
  ): Promise<{ nombre_quizz_done: number; nombre_bonnes_reponses: number }> {
    let nbr_bonnes_reponses = 0;
    let nbr_quizz_done = 0;
    for (const quizz_id of action.quizz_ids) {
      const quizz = utilisateur.history.getQuizzHistoryById(quizz_id);
      if (quizz) {
        nbr_quizz_done++;
        nbr_bonnes_reponses =
          nbr_bonnes_reponses + (quizz.has100ScoreLastAttempt() ? 1 : 0);
      }
    }
    return {
      nombre_bonnes_reponses: nbr_bonnes_reponses,
      nombre_quizz_done: nbr_quizz_done,
    };
  }

  async external_count_actions(thematique?: Thematique): Promise<number> {
    return await this.actionRepository.count({ thematique: thematique });
  }

  public async external_get_user_actions(
    utilisateur: Utilisateur,
    filtre: ActionFilter,
  ): Promise<Action[]> {
    const liste_actions = await this.actionRepository.list(filtre);

    let result: Action[] = [];
    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.code_commune,
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

    return result;
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

  private filtreParConsultation(
    catalogue: CatalogueAction,
    type_consulation: Consultation,
    utilisateur: Utilisateur,
  ) {
    if (!type_consulation || type_consulation === Consultation.tout) {
      catalogue.consultation = Consultation.tout;
      return;
    }
    catalogue.consultation = type_consulation;

    const new_action_list: Action[] = [];

    const target_vue = type_consulation === Consultation.vu;

    for (const action of catalogue.actions) {
      const est_vue = utilisateur.thematique_history.isActionVue(action);
      if ((est_vue && target_vue) || (!est_vue && !target_vue)) {
        new_action_list.push(action);
      }
    }
    catalogue.actions = new_action_list;
  }

  async updateActionStats(block_size: number = 50): Promise<void> {
    const total_user_count = await this.utilisateurRepository.countAll();

    const result_stats = new Map<string, { vues: number; faites: number }>();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.thematique_history],
        );

      for (const user of current_user_list) {
        for (const type_code of user.thematique_history.getListeActionsVues()) {
          const stat = result_stats.get(
            ActionDefinition.getIdFromTypeCode(type_code),
          );
          if (stat) {
            stat.vues++;
          } else {
            result_stats.set(ActionDefinition.getIdFromTypeCode(type_code), {
              faites: 0,
              vues: 1,
            });
          }
        }
        for (const type_code of user.thematique_history.getListeActionsFaites()) {
          const stat = result_stats.get(
            ActionDefinition.getIdFromTypeCode(type_code),
          );
          if (stat) {
            stat.faites++;
          } else {
            result_stats.set(ActionDefinition.getIdFromTypeCode(type_code), {
              faites: 1,
              vues: 0,
            });
          }
        }
      }
    }
    for (const [key, value] of result_stats.entries()) {
      await this.compteurActionsRepository.setCompteur(
        ActionDefinition.getTypeCodeFromString(key),
        value.vues,
        value.faites,
      );
    }
  }
}
