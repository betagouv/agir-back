import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { DistributionSettings } from '../domain/interaction/distributionSettings';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { UserQuizzProfile } from '../domain/quizz/userQuizzProfile';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

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
}
