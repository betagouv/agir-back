import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { Thematique } from '../domain/contenu/thematique';
import { ApplicationError } from '../infrastructure/applicationError';
import { Action } from '../domain/actions/action';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { EchelleAide } from '../domain/aides/echelle';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private aideRepository: AideRepository,
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getOpenCatalogue(thematique: Thematique): Promise<ActionDefinition[]> {
    return this.actionRepository.list({ thematique: thematique });
  }
  async getAction(code: string): Promise<Action> {
    const action_def = await this.actionRepository.getByCode(code);

    if (!action_def) {
      ApplicationError.throwActionNotFound(code);
    }

    const action = new Action(action_def);

    const linked_aides = await this.aideRepository.search({
      besoins: action_def.besoins,
      echelle: EchelleAide.National,
    });

    action.aides = linked_aides;

    return action;
  }
}
