import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionStatus } from '../domain/interaction/interactionStatus';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BadgeRepository } from '../infrastructure/repository/badge.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { BadgeTypes } from '../domain/badge/badgeTypes';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';
import { Thematique } from '../domain/thematique';
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
    thematiques: Thematique[],
    boost: number,
  ) {
    let interactionScores =
      await this.interactionRepository.listInteractionScores(
        utilisateurId,
        thematiques,
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
    const liste_articles = await this.getArticlesForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );

    // FIXME : DESACTIVIATION TEMPORAIRE DES AIDES ET SUIVI
    // const liste_suivis = await this.getSuivisForUtilisateur(utilisateurId);
    const liste_quizz = await this.getQuizzForUtilisateur(
      utilisateurId,
      utilisateur.quizzProfile,
      utilisateur.code_postal,
    );
    /*
    const liste_aides = await this.getAidesForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );
    */

    DistributionSettings.addInteractionsToList(liste_articles, result);
    //DistributionSettings.addInteractionsToList(liste_suivis, result);
    DistributionSettings.addInteractionsToList(liste_quizz, result);
    //DistributionSettings.addInteractionsToList(liste_aides, result);

    // final sort
    result.sort((a, b) => {
      return b.score - a.score;
    });

    // pinned insert
    // FIXME : DESACTIVATION TEMPORAIRE
    /*
    const pinned_interactions =
      await this.interactionRepository.listInteractionsByFilter({
        utilisateurId,
        maxNumber: 7,
        pinned: true,
        locked: false,
        code_postal: utilisateur.code_postal,
        done: false,
      });
    DistributionSettings.insertPinnedInteractions(pinned_interactions, result);
    */

    // locked insert at fixed positions
    // FIXME : DESACTIVATION TEMPORAIRE
    /*
    const locked_interactions =
      await this.interactionRepository.listInteractionsByFilter({
        utilisateurId,
        maxNumber: DistributionSettings.TARGET_LOCKED_INTERACTION_NUMBER,
        locked: true,
        pinned: false,
        code_postal: utilisateur.code_postal,
        done: false,
      });
    result = DistributionSettings.insertLockedInteractions(
      locked_interactions,
      result,
    );
    */

    return result;
  }

  async reset(date?: Date): Promise<number> {
    const date_seuil = date || new Date();
    return this.interactionRepository.resetAllInteractionStatus(date_seuil);
  }

  async getArticlesForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: DistributionSettings.getPreferedOfType(
        InteractionType.article,
      ),
      type: InteractionType.article,
      pinned: false,
      code_postal,
      done: false,
    });
  }

  async getSuivisForUtilisateur(utilisateurId: string): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: DistributionSettings.getPreferedOfType(
        InteractionType.suivi_du_jour,
      ),
      type: InteractionType.suivi_du_jour,
      pinned: false,
      done: false,
    });
  }

  async getQuizzForUtilisateur(
    utilisateurId: string,
    quizzProfile: UserQuizzProfile,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: DistributionSettings.getPreferedOfType(InteractionType.quizz),
      type: InteractionType.quizz,
      pinned: false,
      code_postal,
      done: false,
    });
  }

  async getAidesForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: DistributionSettings.getPreferedOfType(InteractionType.aide),
      type: InteractionType.aide,
      pinned: false,
      code_postal,
      done: false,
    });
  }
}
