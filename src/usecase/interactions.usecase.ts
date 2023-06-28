import { Injectable } from '@nestjs/common';
import { APIInteractionType } from '../infrastructure/api/types/interaction';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';

@Injectable()
export class InteractionsUsecase {
  constructor(private interactionRepository: InteractionRepository) {}

  async listInteractions(utilisateurId:string): Promise<APIInteractionType[]> {
    return this.interactionRepository.listInteractionsByUtilisateurId(utilisateurId);
  }
}