import { Injectable } from '@nestjs/common';
import { Interaction } from '../domain/interaction/interaction';
import { InteractionRepository } from '../infrastructure/repository/interaction.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InteractionType } from '../domain/interaction/interactionType';
import { Recommandation } from '../../src/domain/recommandation';
import { RecommandationUsecase } from './recommandation.usecase';

@Injectable()
export class InteractionsUsecase {
  constructor(
    private interactionRepository: InteractionRepository,
    private utilisateurRepository: UtilisateurRepository,
    private recommandationUsecase: RecommandationUsecase,
  ) {}

  async listInteractions(
    utilisateurId: string,
  ): Promise<(Interaction | Recommandation)[]> {
    let result: (Interaction | Recommandation)[] = [];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    if (utilisateur.does_get_article_quizz_from_repo()) {
      return await this.recommandationUsecase.listRecommandations(
        utilisateurId,
      );
    } else {
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
    }

    return result;
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
