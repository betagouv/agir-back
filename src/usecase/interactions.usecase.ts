import { Injectable } from '@nestjs/common';
import { Interaction } from '@prisma/client';
import { InteractionStatus } from '../domain/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';

@Injectable()
export class InteractionsUsecase {
  constructor(private interactionRepository: InteractionRepository) {}

  async listInteractions(utilisateurId: string): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByUtilisateurId(
      utilisateurId,
    );
  }

  async updateStatus(interactionId: string, status: InteractionStatus) {
    return this.interactionRepository.updateInteractionStatusData(
      interactionId,
      status,
    );
  }
}
