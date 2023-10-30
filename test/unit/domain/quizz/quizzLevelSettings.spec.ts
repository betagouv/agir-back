import { Interaction } from '../../../../src/domain/interaction/interaction';
import { InteractionType } from '../../../../src/domain/interaction/interactionType';
import { DifficultyLevel } from '../../../../src/domain/difficultyLevel';
import { QuizzLevelSettings } from '../../../../src/domain/quizz/quizzLevelSettings';
import { TestUtil } from '../../../../test/TestUtil';

describe('QuizzLevelSettings', () => {
  it('estEligiblePassageNiveau : renvoie false si liste vide', () => {
    // GIVEN
    const interactions = [];

    // WHEN
    const result = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('estEligiblePassageNiveau : renvoie true si eligible 1=>2', () => {
    // GIVEN
    const interactions = [
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 70,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 75,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 80,
        }),
      ),
    ];

    // WHEN
    const result = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );

    // THEN
    expect(result).toStrictEqual(true);
  });
  it('estEligiblePassageNiveau : renvoie false si fail au milieu de la série ', () => {
    // GIVEN
    const interactions = [
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 70,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 45,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 80,
        }),
      ),
    ];

    // WHEN
    const result = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('estEligiblePassageNiveau : renvoie false si fail au début de la série ', () => {
    // GIVEN
    const interactions = [
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 30,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 70,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 75,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 80,
        }),
      ),
    ];

    // WHEN
    const result = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('estEligiblePassageNiveau : renvoie false si série trop courte', () => {
    // GIVEN
    const interactions = [
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 75,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 80,
        }),
      ),
    ];

    // WHEN
    const result = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('estEligiblePassageNiveau : le niveau courant influe sur le résultat', () => {
    // GIVEN
    const interactions = [
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 75,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 80,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 90,
        }),
      ),
      new Interaction(
        TestUtil.interactionData({
          type: InteractionType.quizz,
          quizz_score: 85,
        }),
      ),
    ];

    // WHEN
    const r1 = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L1,
      interactions,
    );
    const r2 = QuizzLevelSettings.isLevelCompleted(
      DifficultyLevel.L2,
      interactions,
    );

    // THEN
    expect(r1).toStrictEqual(true);
    expect(r2).toStrictEqual(false);
  });
});
