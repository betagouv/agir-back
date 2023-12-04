import { Injectable } from '@nestjs/common';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { Todo } from '../domain/todo/todo';
import { TodoRepository } from '../infrastructure/repository/todo.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  Interaction,
  InteractionIdProjection,
} from '../domain/interaction/interaction';

import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ApplicationError } from '../infrastructure/applicationError';

@Injectable()
export class LinkyUsecase {
  constructor(private utilisateurRepository: UtilisateurRepository) {}

  souscription(utilisateurId: string) {}
}
