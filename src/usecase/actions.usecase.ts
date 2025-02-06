import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { ActionDefinition } from '../domain/actions/actionDefinition';

@Injectable()
export class ActionUsecase {
  constructor(
    private actionRepository: ActionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private personnalisator: Personnalisator,
  ) {}

  async getOpenCatalogue(): Promise<ActionDefinition[]> {
    return ActionRepository.getCatalogue();
  }
}
