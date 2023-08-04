import { Injectable } from '@nestjs/common';
import { Interaction as DBInteraction } from '@prisma/client';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionStatus } from '../domain/interaction/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { isUndefined } from 'util';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<DBInteraction[]> {
    let result: Interaction[] = [];
    for (const type in InteractionType) {
      let listInteracionsOfType =
        await this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
          utilisateurId,
          type as InteractionType,
          DistributionSettings.getPreferedOfType(type as InteractionType),
        );
      result = DistributionSettings.addInteractionsToList(
        listInteracionsOfType,
        result,
      );
    }
    result.sort((a, b) => a.reco_score - b.reco_score);
    return result;
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
