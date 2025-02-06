import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { Thematique } from '../domain/contenu/thematique';
import { ApplicationError } from '../infrastructure/applicationError';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getOpenCatalogue(thematique: Thematique): Promise<ActionDefinition[]> {
    return this.actionRepository.list({ thematique: thematique });
  }
  async getAction(code: string): Promise<ActionDefinition> {
    const result = await this.actionRepository.getByCode(code);

    if (!result) {
      ApplicationError.throwActionNotFound(code);
    }
    return result;
  }
}
