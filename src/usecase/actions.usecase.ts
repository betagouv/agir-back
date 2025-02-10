import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { Thematique } from '../domain/contenu/thematique';
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

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private aideRepository: AideRepository,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getOpenCatalogue(thematique: Thematique): Promise<ActionDefinition[]> {
    return this.actionRepository.list({ thematique: thematique });
  }
  async getAction(code: string, code_commune: string): Promise<Action> {
    const action_def = await this.actionRepository.getByCode(code);

    if (!action_def) {
      ApplicationError.throwActionNotFound(code);
    }

    const action = new Action(action_def);

    let commune: Commune;
    if (code_commune) {
      commune = this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
    }

    let linked_aides: AideDefinition[];
    if (commune) {
      linked_aides = await this.aideRepository.search({
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

    action.aides = linked_aides;
    action.services = liste_services;

    return action;
  }
}
