import { Interaction } from '../interaction/interaction';
import { DifficultyLevel } from '../difficultyLevel';

export class QuizzLevelSettings {
  static LEVEL_1_SERIE = 3;
  static LEVEL_1_MIN_POURCENT = 70;

  static LEVEL_2_SERIE = 4;
  static LEVEL_2_MIN_POURCENT = 80;

  static LEVEL_3_SERIE = 5;
  static LEVEL_3_MIN_POURCENT = 85;

  static LEVEL_4_SERIE = 6;
  static LEVEL_4_MIN_POURCENT = 90;

  static LEVEL_5_SERIE = 10;
  static LEVEL_5_MIN_POURCENT = 95;

  public static isLevelCompleted(
    niveauCourant: DifficultyLevel,
    derniersQuizz: Interaction[],
  ) {
    if (derniersQuizz.length === 0) return false;

    let eligible = true;
    let serie = 0;
    let index = 0;
    while (
      eligible &&
      serie < QuizzLevelSettings[`LEVEL_${niveauCourant}_SERIE`] &&
      index < derniersQuizz.length
    ) {
      const quizz = derniersQuizz[index++];
      if (
        quizz.quizz_score >=
        QuizzLevelSettings[`LEVEL_${niveauCourant}_MIN_POURCENT`]
      ) {
        serie++;
      } else {
        eligible = false;
      }
    }
    return (
      eligible && serie == QuizzLevelSettings[`LEVEL_${niveauCourant}_SERIE`]
    );
  }
}
