import { Injectable } from '@nestjs/common';
import { Action, ActionService } from '../domain/actions/action';
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
  ActionFilter,
  ActionRepository,
} from '../infrastructure/repository/action.repository';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import {
  Commune,
  CommuneRepository,
} from '../infrastructure/repository/commune/commune.repository';
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BibliothequeUsecase } from './bibliotheque.usecase';
import { CMSImportUsecase } from './cms.import.usecase';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private bibliothequeUsecase: BibliothequeUsecase,
    private cMSImportUsecase: CMSImportUsecase,
    private fAQRepository: FAQRepository,
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

    let result = new CatalogueAction();
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
        result.actions.push(action);
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
        result.actions.push(action);
      }
    }

    this.setFiltreThematiqueToCatalogue(result, filtre_thematiques);

    return result;
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

    catalogue.actions = await this.internal_get_user_actions(utilisateur, {
      liste_thematiques:
        filtre_thematiques.length > 0 ? filtre_thematiques : undefined,
      titre_fragment: titre,
    });

    this.setFiltreThematiqueToCatalogue(catalogue, filtre_thematiques);

    this.filtreParConsultation(catalogue, consultation, utilisateur);

    return catalogue;
  }

  async getActionPreview(
    content_id: string,
    type: TypeAction,
  ): Promise<Action> {
    if (type !== TypeAction.classique) {
      ApplicationError.throwActionNotFoundById(content_id, type);
    }

    const action_def = await this.cMSImportUsecase.getActionClassiqueFromCMS(
      content_id,
    );

    if (!action_def) {
      ApplicationError.throwActionNotFoundById(content_id, type);
    }

    const action = new Action(action_def);

    const linked_aides = await this.aideRepository.search({
      besoins: action_def.besoins,
      echelle: Echelle.National,
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

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }

    action.setListeAides(linked_aides);
    action.services = liste_services;

    return action;
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

    return action;
  }

  async getUtilisateurAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
  ): Promise<Action> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
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
      const quizz = await this.bibliothequeUsecase.internal_get_quizz(quizz_id);
      action.quizz_liste.push(quizz);
    }

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }

    action.deja_vue = utilisateur.thematique_history.isActionVue(
      action.getTypeCode(),
    );

    utilisateur.thematique_history.setActionCommeVue(action.getTypeCode());

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );

    return action;
  }

  public async calculeScoreQuizzAction(
    utilisateurId: string,
    code_action_quizz: string,
  ): Promise<{ nombre_quizz_done: number; nombre_bonnes_reponses }> {
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

    let nbr_bonnes_reponses = 0;
    let nbr_quizz_done = 0;
    for (const quizz_id of action_def.quizz_ids) {
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

  async internal_count_actions(thematique?: Thematique): Promise<number> {
    return await this.actionRepository.count({ thematique: thematique });
  }

  public async internal_get_user_actions(
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
      action.deja_vue = utilisateur.thematique_history.isActionVue(
        action.getTypeCode(),
      );
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
      const est_vue = utilisateur.thematique_history.isActionVue(
        action.getTypeCode(),
      );
      if ((est_vue && target_vue) || (!est_vue && !target_vue)) {
        new_action_list.push(action);
      }
    }
    catalogue.actions = new_action_list;
  }
}
