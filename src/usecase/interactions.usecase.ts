import { Injectable } from '@nestjs/common';
import { Interaction as DBInteraction } from '@prisma/client';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionStatus } from '../domain/interaction/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { InteractionDefinitionRepository } from '../infrastructure/repository/interactionDefinition.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { BadgeTypeEnum } from '../domain/badgeType';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private badgeRepository: BadgeRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<DBInteraction[]> {
    let result: Interaction[] = [];

    // Integration des interactions par types successifs
    for (const type in InteractionType) {
      const interactionType = type as InteractionType;
      let listInteracionsOfType =
        await this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
          {
            utilisateurId,
            maxNumber: DistributionSettings.getPreferedOfType(interactionType),
            type: interactionType,
            pinned: false,
          },
        );
      result = DistributionSettings.addInteractionsToList(
        listInteracionsOfType,
        result,
      );
    }
    // final sort
    result.sort((a, b) => a.reco_score - b.reco_score);

    // pinned insert
    const pinned_interactions =
      await this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
        {
          utilisateurId,
          maxNumber: 7,
          pinned: true,
          locked: false,
        },
      );
    DistributionSettings.insertPinnedInteractions(pinned_interactions, result);

    // locked insert at fixed positions
    const locked_interactions =
      await this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
        {
          utilisateurId,
          maxNumber: DistributionSettings.TARGET_LOCKED_INTERACTION_NUMBER,
          locked: true,
          pinned: false,
        },
      );
    result = DistributionSettings.insertLockedInteractions(
      locked_interactions,
      result,
    );

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

    if (status.succeeded && stored_interaction.type === InteractionType.quizz) {
      await this.badgeRepository.createUniqueBadge(
        utilisateurId,
        BadgeTypeEnum.premier_quizz,
      );
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
