import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';

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

    const liste_articles = await this.getArticlesForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );

    const liste_quizz = await this.getQuizzForUtilisateur(
      utilisateurId,
      utilisateur.code_postal,
    );

    result = result.concat(liste_articles);
    result = result.concat(liste_quizz);

    return result.concat();
  }

  async getArticlesForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: 2,
      type: InteractionType.article,
      pinned: false,
      code_postal,
      done: false,
    });
  }

  async getQuizzForUtilisateur(
    utilisateurId: string,
    code_postal: string,
  ): Promise<Interaction[]> {
    return this.interactionRepository.listInteractionsByFilter({
      utilisateurId,
      maxNumber: 2,
      type: InteractionType.quizz,
      pinned: false,
      code_postal,
      done: false,
    });
  }
}
