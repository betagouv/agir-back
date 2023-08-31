import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionStatus } from '../domain/interaction/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { BadgeTypes } from '../domain/badgeTypes';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { Categorie } from '../../src/domain/categorie';
import { Decimal } from '@prisma/client/runtime/library';
import { QuizzLevelSettings } from '../../src/domain/quizz/quizzLevelSettings';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private badgeRepository: BadgeRepository,
  ) {}

  async updateInteractionScoreByCategories(
    utilisateurId: string,
    categories: Categorie[],
    boost: number,
  ) {
    let interactionScores =
      await this.interactionRepository.listInteractionScores(
        utilisateurId,
        categories,
      );
    if (boost > 1) {
      interactionScores.forEach((inter) => {
        inter.upScore(new Decimal(boost));
      });
    } else {
      interactionScores.forEach((inter) => {
        inter.downScore(new Decimal(-boost));
      });
    }
    return this.interactionRepository.updateInteractionScores(
      interactionScores,
    );
  }

  async listInteractions(utilisateurId: string): Promise<Interaction[]> {
    let result: Interaction[] = [];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    // Integration des interactions par types successifs
    const liste_articles = await this.getArticlesForUtilisateur(utilisateurId);
    const liste_suivis = await this.getSuivisForUtilisateur(utilisateurId);
    const liste_quizz = await this.getQuizzForUtilisateur(
      utilisateurId,
      utilisateur.quizzProfile,
    );
    const liste_aides = await this.getAidesForUtilisateur(utilisateurId);

    DistributionSettings.addInteractionsToList(liste_articles, result);
    DistributionSettings.addInteractionsToList(liste_suivis, result);
    DistributionSettings.addInteractionsToList(liste_quizz, result);
    DistributionSettings.addInteractionsToList(liste_aides, result);

    // final sort
    result.sort((a, b) => {
      return b.score.minus(a.score).isNegative() ? -1 : 1;
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

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    if (status.done && !stored_interaction.done) {
      await this.utilisateurRepository.addPointsToUtilisateur(
        utilisateurId,
        stored_interaction.points,
      );
      stored_interaction.setNextScheduledReset();
    }

    stored_interaction.updateStatus(status);

    await this.interactionRepository.partialUpdateInteraction(
      stored_interaction,
    );

    if (status.quizz_score) {
      await this.badgeRepository.createUniqueBadge(
        utilisateurId,
        BadgeTypes.premier_quizz,
      );

      const lastQuizzOfCategorie =
        await this.interactionRepository.listLastDoneQuizzByCategorieAndDifficulty(
          utilisateurId,
          stored_interaction.categorie,
          stored_interaction.difficulty,
        );
      let isLevelCompleted = QuizzLevelSettings.isLevelCompleted(
        stored_interaction.difficulty,
        lastQuizzOfCategorie,
      );
      utilisateur.quizzProfile.setLevelCompletion(
        stored_interaction.categorie,
        isLevelCompleted,
      );
      await this.utilisateurRepository.updateQuizzProfile(
        utilisateurId,
        utilisateur.quizzProfile,
      );
    }
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
    utilisateurId: string,
    quizzProfile: UserQuizzProfile,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listMaxEligibleInteractionsByUtilisateurIdAndType(
      {
        utilisateurId,
        maxNumber: DistributionSettings.getPreferedOfType(
          InteractionType.quizz,
        ),
        type: InteractionType.quizz,
        pinned: false,
        quizzProfile: quizzProfile,
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
