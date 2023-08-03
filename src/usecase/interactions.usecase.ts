import { Injectable } from '@nestjs/common';
import { Interaction as DBInteraction } from '@prisma/client';
import { InteractionStatus } from '../domain/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<DBInteraction[]> {
    return this.interactionRepository.listInteractionsByUtilisateurId(
      utilisateurId,
    );
  }

  async updateStatus(
    utilisateurId: string,
    interactionId: string,
    status: InteractionStatus,
  ) {
    const stored_interaction =
      await this.interactionRepository.getInteractionById(interactionId);

    if (status.done && !stored_interaction.done) {
      await this.utilisateurRepository.addPointsToUtilisateur(
        utilisateurId,
        stored_interaction.points,
      );
      stored_interaction.setNextScheduledReset();
    }

    stored_interaction.updateStatus(status);
    return this.interactionRepository.partialUpdateInteraction(
      stored_interaction,
    );
  }

  async reset(date?: Date): Promise<number> {
    const date_seuil = date || new Date();
    return this.interactionRepository.resetAllInteractionStatus(date_seuil);
  }
}
