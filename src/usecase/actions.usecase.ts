import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { Thematique } from '../domain/thematique/thematique';
import { ApplicationError } from '../infrastructure/applicationError';
import { Action, ActionService } from '../domain/actions/action';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { EchelleAide } from '../domain/aides/echelle';
import {
  Commune,
  CommuneRepository,
} from '../infrastructure/repository/commune/commune.repository';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { ServiceRechercheID } from '../domain/bibliotheque_services/recherche/serviceRechercheID';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { TypeAction } from '../domain/actions/typeAction';
import { BibliothequeUsecase } from './bibliotheque.usecase';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private bibliothequeUsecase: BibliothequeUsecase,
  ) {}

  async getOpenCatalogue(
    thematique?: Thematique,
    code_commune?: string,
  ): Promise<Action[]> {
    const liste_actions = await this.actionRepository.list({
      thematique: thematique,
    });

    let result: Action[] = [];
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
        result.push(action);
      }
    } else {
      for (const action_def of liste_actions) {
        const count_aides = await this.aideRepository.count({
          besoins: action_def.besoins,
          echelle: EchelleAide.National,
          date_expiration: new Date(),
        });
        const action = new Action(action_def);
        action.nombre_aides = count_aides;
        result.push(action);
      }
    }

    return result;
  }

  async getUtilisateurCatalogue(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<Action[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    Utilisateur.checkState(utilisateur);

    return await this.internal_get_user_actions(utilisateur, thematique);
  }

  public async internal_get_user_actions(
    utilisateur: Utilisateur,
    thematique: Thematique,
  ): Promise<Action[]> {
    const liste_actions = await this.actionRepository.list({
      thematique: thematique,
    });

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
      result.push(action);
    }

    return result;
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
        echelle: EchelleAide.National,
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
      [],
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

    return action;
  }

  public async calculeScoreQuizzAction(
    utilisateurId: string,
    code_action_quizz: string,
  ): Promise<number> {
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

    let pourcent_total = 0;
    let nombre_quizz_done = 0;
    for (const quizz_id of action_def.quizz_ids) {
      const quizz = utilisateur.history.getQuizzHistoryById(quizz_id);
      if (quizz) {
        nombre_quizz_done++;
        pourcent_total =
          pourcent_total + (quizz.has100ScoreLastAttempt() ? 100 : 0);
      }
    }
    if (nombre_quizz_done === 0) {
      return 0;
    }
    return Math.round(pourcent_total / nombre_quizz_done);
  }

  async internal_count_actions(thematique?: Thematique): Promise<number> {
    return await this.actionRepository.count({ thematique: thematique });
  }
}
