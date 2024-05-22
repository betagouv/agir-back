import { Injectable } from '@nestjs/common';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { QuizStatistiqueRepository } from '../../src/infrastructure/repository/quizStatistique.repository';
import { QuizzRepository } from '../../src/infrastructure/repository/quizz.repository';

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
      { nombreDeBonneReponse: number; nombreDeMauvaiseReponse: number }
    > = {};

    const listeUtilisateursIds =
      await this.utilisateurRepository.listUtilisateurIds();

    for (let index = 0; index < listeUtilisateursIds.length; index++) {
      const user = await this.utilisateurRepository.getById(
        listeUtilisateursIds[index],
      );

      user.history.quizz_interactions.forEach((quiz) => {
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
      const titreDuQuiz = await this.quizRepository.getQuizzByContentId(key);

      await this.quizStatistiqueRepository.upsertStatistiquesDUnQuiz(
        key,
        titreDuQuiz.titre,
        value.nombreDeBonneReponse,
        value.nombreDeMauvaiseReponse,
      );
    }

    const listeDesQuizId = Object.keys(quizRecord);

    return listeDesQuizId;
  }
}
