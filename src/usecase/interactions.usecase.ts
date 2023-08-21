import { Injectable } from '@nestjs/common';
import { Interaction as DBInteraction, Utilisateur } from '@prisma/client';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionStatus } from '../domain/interaction/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { BadgeTypeEnum } from '../domain/badgeType';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private badgeRepository: BadgeRepository,
  ) {}

  async listInteractions(utilisateurId: string): Promise<DBInteraction[]> {
    let result: Interaction[] = [];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    // Integration des interactions par types successifs
    const liste_articles = await this.getArticlesForUtilisateur(utilisateurId);
    const liste_suivis = await this.getSuivisForUtilisateur(utilisateurId);
    const liste_quizz = await this.getQuizzForUtilisateur(utilisateur);
    const liste_aides = await this.getAidesForUtilisateur(utilisateurId);

    DistributionSettings.addInteractionsToList(liste_articles, result);
    DistributionSettings.addInteractionsToList(liste_suivis, result);
    DistributionSettings.addInteractionsToList(liste_quizz, result);
    DistributionSettings.addInteractionsToList(liste_aides, result);

    // final sort
    result.sort((a, b) => {
      if (
        a.type === InteractionType.quizz &&
        b.type === InteractionType.quizz
      ) {
        return a.difficulty - b.difficulty;
      } else {
        return a.reco_score - b.reco_score;
      }
    });

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

  async getArticlesForUtilisateur(
    utilisateurId: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
      {
        utilisateurId,
        maxNumber: DistributionSettings.getPreferedOfType(
          InteractionType.article,
        ),
        type: InteractionType.article,
        pinned: false,
      },
    );
  }
  async getSuivisForUtilisateur(utilisateurId: string): Promise<Interaction[]> {
    return this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
      {
        utilisateurId,
        maxNumber: DistributionSettings.getPreferedOfType(
          InteractionType.suivi_du_jour,
        ),
        type: InteractionType.suivi_du_jour,
        pinned: false,
      },
    );
  }
  async getQuizzForUtilisateur(
    utilisateur: Utilisateur,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
      {
        utilisateurId: utilisateur.id,
        maxNumber: DistributionSettings.getPreferedOfType(
          InteractionType.quizz,
        ),
        type: InteractionType.quizz,
        pinned: false,
        minDifficulty: utilisateur.quizzDifficulty,
      },
    );
  }
  async getAidesForUtilisateur(utilisateurId: string): Promise<Interaction[]> {
    return this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
      {
        utilisateurId,
        maxNumber: DistributionSettings.getPreferedOfType(InteractionType.aide),
        type: InteractionType.aide,
        pinned: false,
      },
    );
  }
}
