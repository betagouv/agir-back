import { Injectable } from '@nestjs/common';
import { Interaction } from '@prisma/client';
import { InteractionStatus } from '../domain/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByUtilisateurId(
      utilisateurId,
    );
  }

  async updateStatus(
    utilisateurId: string,
    interactionId: string,
    status: InteractionStatus,
  ) {
    const interactionDb = await this.interactionRepository.getInteractionById(
      interactionId,
    );

    if (status.done && !interactionDb.done) {
      await this.utilisateurRepository.addPointsToUtilisateur(
        utilisateurId,
        interactionDb.points,
      );
    }
    return this.interactionRepository.updateInteractionStatusData(
      interactionId,
      status,
    );
  }
}
