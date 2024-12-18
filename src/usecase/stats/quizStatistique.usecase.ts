import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../infrastructure/repository/utilisateur/utilisateur.repository';
import { QuizStatistiqueRepository } from '../../infrastructure/repository/quizStatistique.repository';
import { QuizzRepository } from '../../infrastructure/repository/quizz.repository';
import { Scope } from '../../domain/utilisateur/utilisateur';

@Injectable()
export class QuizStatistiqueUsecase {
  constructor(
    private quizRepository: QuizzRepository,
    private utilisateurRepository: UtilisateurRepository,
    private quizStatistiqueRepository: QuizStatistiqueRepository,
  ) {}

  async calculStatistique(): Promise<string[]> {
    const quizRecord: Record<
      string,
      {
        nombreDeBonneReponse: number;
        nombreDeMauvaiseReponse: number;
      }
    > = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (const utilisateurId of listeUtilisateursIds) {
      const utilisateur = await this.utilisateurRepository.getById(
        utilisateurId,
        [Scope.history_article_quizz_aides],
      );

      utilisateur.history.quizz_interactions.forEach((quiz) => {
        if (!quizRecord[quiz.content_id]) {
          quizRecord[quiz.content_id] = {
            nombreDeBonneReponse: 0,
            nombreDeMauvaiseReponse: 0,
          };
        }
        if (quiz.points_en_poche) {
          quizRecord[quiz.content_id].nombreDeBonneReponse++;
        } else {
          quizRecord[quiz.content_id].nombreDeMauvaiseReponse++;
        }
      });
    }

    const quizRecordEntries = Object.entries(quizRecord);

    for (let i = 0; i < quizRecordEntries.length; i++) {
      const [key, value] = quizRecordEntries[i];
      const titreDuQuiz =
        await this.quizRepository.getQuizzDefinitionByContentId(key);

      await this.quizStatistiqueRepository.upsertStatistiquesDUnQuiz(
        key,
        titreDuQuiz ? titreDuQuiz.titre : `Quizz [${key}] supprimé`,
        value.nombreDeBonneReponse,
        value.nombreDeMauvaiseReponse,
      );
    }

    const listeDesQuizId = Object.keys(quizRecord);

    return listeDesQuizId;
  }
}
