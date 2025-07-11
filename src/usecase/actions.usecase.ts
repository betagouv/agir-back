import { Injectable } from '@nestjs/common';
import { Action, ActionService } from '../domain/actions/action';
import { ACTION_BILAN_MAPPING_ENCHAINEMENTS } from '../domain/actions/actionBilanMappingEnchainements';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import {
  CatalogueAction,
  Consultation,
  Ordre,
  Realisation,
} from '../domain/actions/catalogueAction';
import { ActionBilanID, TypeAction } from '../domain/actions/typeAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { ServiceRechercheID } from '../domain/bibliotheque_services/recherche/serviceRechercheID';
import { Article } from '../domain/contenu/article';
import { EnchainementDefinition } from '../domain/kyc/enchainementDefinition';
import { SousThematique } from '../domain/thematique/sousThematique';
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
import { ArticleRepository } from '../infrastructure/repository/article.repository';
import {
  Commune,
  CommuneRepository,
} from '../infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { ThematiqueRepository } from '../infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BibliothequeUsecase } from './bibliotheque.usecase';

const BAD_CHAR_LISTE = `^#&*<>/{|}$%@+`;
const BAD_CHAR_REGEXP = new RegExp(`^[` + BAD_CHAR_LISTE + ']+$');

type QuestionAction = {
  nom: string;
  prenom: string;
  pseudo: string;
  email: string;
  date: Date;
  question: string;
  action_cms_id: string;
  action_titre: string;
  action_faite: boolean;
};

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private articleRepository: ArticleRepository,
    private compteurActionsRepository: CompteurActionsRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private fAQRepository: FAQRepository,
    private personnalisator: Personnalisator,
    private bibliothequeUsecase: BibliothequeUsecase,
  ) {}

  static MAX_FEEDBACK_LENGTH = 500;
  static MAX_QUESTION_LENGTH = 500;

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
    filtre_thematiques: Thematique[],
    filtre_sous_thematiques: SousThematique[],
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
      filtre_thematiques.length > 0 ? filtre_thematiques : undefined;
    filtre.liste_sous_thematiques =
      filtre_sous_thematiques.length > 0 ? filtre_sous_thematiques : undefined;
    filtre.titre_fragment = titre;

    catalogue.actions = await this.external_get_user_actions(
      utilisateur,
      filtre,
    );

    this.setFiltreThematiqueToCatalogue(catalogue, filtre_thematiques);
    this.setFiltreSousThematiqueToCatalogue(catalogue, filtre_sous_thematiques);

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

  async getAction(
    code: string,
    type: TypeAction,
    code_commune: string,
  ): Promise<Action> {
    const action_def = await this.actionRepository.getByCodeAndTypeFromDB(
      code,
      type,
    );

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
        sous_categorie: action_def.recette_sous_categorie,
        recherche_service_id: ServiceRechercheID.recettes,
      });
    }
    if (action_def.pdcn_categorie) {
      liste_services.push({
        categorie: action_def.pdcn_categorie,
        sous_categorie: undefined,
        recherche_service_id: ServiceRechercheID.proximite,
      });
    }
    if (action_def.lvo_action) {
      liste_services.push({
        categorie: action_def.lvo_action,
        sous_categorie: undefined,
        recherche_service_id: ServiceRechercheID.longue_vie_objets,
      });
    }

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }
    action.article_liste = [];
    for (const article_id of action_def.article_ids) {
      action.article_liste.push(
        new Article(this.articleRepository.getArticle(article_id)),
      );
    }

    action.setListeAides(linked_aides);
    action.services = liste_services;

    this.setCompteurActionsEtLabel(action);

    return this.personnalisator.personnaliser(action, undefined, [
      CLE_PERSO.espace_insecable,
    ]);
  }

  async shareAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = this.actionRepository.getActionDefinitionByTypeCode({
      type: type,
      code: code,
    });

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }

    utilisateur.thematique_history.shareAction(action_def);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  async feedbackAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
    like_level: number,
    feedback: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = this.actionRepository.getActionDefinitionByTypeCode({
      type: type,
      code: code,
    });

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }
    if (like_level) {
      if (![1, 2, 3, 4].includes(like_level)) {
        ApplicationError.throwBadLikeLevel(like_level);
      }
    }
    if (feedback) {
      if (feedback.length > ActionUsecase.MAX_FEEDBACK_LENGTH) {
        ApplicationError.throwTooBigData(
          'feedback',
          feedback,
          ActionUsecase.MAX_FEEDBACK_LENGTH,
        );
      }
      if (!BAD_CHAR_REGEXP.test(feedback)) {
        ApplicationError.throwBadChar(BAD_CHAR_LISTE);
      }
    }

    utilisateur.thematique_history.setActionFeedback(
      action_def,
      like_level,
      feedback,
    );

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  async questionAction(
    code: string,
    type: TypeAction,
    utilisateurId: string,
    question: string,
  ): Promise<void> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = this.actionRepository.getActionDefinitionByTypeCode({
      type: type,
      code: code,
    });

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }
    if (!question) {
      ApplicationError.throwMissingQuestion();
    }
    if (question.length > ActionUsecase.MAX_QUESTION_LENGTH) {
      ApplicationError.throwTooBigData(
        'question',
        question,
        ActionUsecase.MAX_QUESTION_LENGTH,
      );
    }
    if (!BAD_CHAR_REGEXP.test(question)) {
      ApplicationError.throwBadChar(BAD_CHAR_LISTE);
    }
    utilisateur.thematique_history.setActionQuestion(action_def, question);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
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
      [
        Scope.thematique_history,
        Scope.kyc,
        Scope.logement,
        Scope.recommandation,
      ],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = this.actionRepository.getActionDefinitionByTypeCode({
      code: code,
      type: type,
    });

    if (!action_def) {
      ApplicationError.throwActionNotFound(code, type);
    }

    const action = Action.newActionFromUser(action_def, utilisateur);

    utilisateur.recommandation.trierEtFiltrerRecommandations([action]);

    const commune = this.communeRepository.getCommuneByCodeINSEE(
      utilisateur.logement.code_commune,
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
        sous_categorie: action_def.recette_sous_categorie,
        recherche_service_id: ServiceRechercheID.recettes,
      });
    }
    if (action_def.pdcn_categorie) {
      liste_services.push({
        categorie: action_def.pdcn_categorie,
        recherche_service_id: ServiceRechercheID.proximite,
        sous_categorie: undefined,
      });
    }
    if (action_def.lvo_action) {
      liste_services.push({
        categorie: action_def.lvo_action,
        recherche_service_id: ServiceRechercheID.longue_vie_objets,
        sous_categorie: undefined,
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
    action.article_liste = [];
    for (const article_id of action_def.article_ids) {
      action.article_liste.push(
        new Article(this.articleRepository.getArticle(article_id)),
      );
    }

    if (action_def.type === TypeAction.bilan) {
      const kyc_codes = this.external_get_kyc_codes_from_action_bilan(
        action_def.code,
      );
      action.kycs =
        utilisateur.kyc_history.getEnchainementKYCsEligibles(kyc_codes);
    }
    if (action_def.type === TypeAction.simulateur) {
      action.kycs = utilisateur.kyc_history.getEnchainementKYCsEligibles(
        action_def.kyc_codes,
      );
    }

    this.setCompteurActionsEtLabel(action);

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

  public async calculeScoreQuizzAction(
    utilisateurId: string,
    code_action_quizz: string,
  ): Promise<{ nombre_quizz_done: number; nombre_bonnes_reponses: number }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.history_article_quizz_aides],
    );
    Utilisateur.checkState(utilisateur);

    const action_def = await this.actionRepository.getByCodeAndTypeFromDB(
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
      result = utilisateur.recommandation.trierEtFiltrerRecommandations(result);
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

  private setFiltreSousThematiqueToCatalogue(
    catalogue: CatalogueAction,
    liste_sous_thematiques: SousThematique[],
  ) {
    for (const sous_thematique of Object.values(SousThematique)) {
      catalogue.addSelectedSousThematique(
        sous_thematique,
        liste_sous_thematiques.includes(sous_thematique),
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

  async getAllQuestions(block_size: number = 200): Promise<QuestionAction[]> {
    const total_user_count = await this.utilisateurRepository.countAll();

    const result: QuestionAction[] = [];

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.thematique_history],
          {},
        );

      for (const user of current_user_list) {
        const liste_questions = user.thematique_history.getAllQuestions();
        for (const question of liste_questions) {
          const action_def =
            this.actionRepository.getActionDefinitionByTypeCode(
              question.action,
            );
          result.push({
            action_cms_id: action_def.cms_id,
            action_faite: question.question.est_action_faite,
            action_titre: action_def.titre,
            date: question.question.date,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            pseudo: user.pseudo,
            question: question.question.question,
          });
        }
      }
    }
    return result;
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
          {},
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
