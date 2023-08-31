import { DifficultyLevel } from '../../../../src/domain/difficultyLevel';
import { Categorie } from '../../../../src/domain/categorie';
import { UserQuizzProfile } from '../../../../src/domain/quizz/userQuizzProfile';

describe('UserQuizzProfile', () => {
  it('new : should build with uncomplete level data and set to level 1 missing keys', () => {
    // GIVEN
    const levels = {
      alimentation: { level: DifficultyLevel.L3, isCompleted: true },
    };

    // WHEN
    const quizzProfile = new UserQuizzProfile(levels);

    // THEN
    expect(quizzProfile.getLevel(Categorie.alimentation)).toStrictEqual(
      DifficultyLevel.L3,
    );
    expect(quizzProfile.isLevelCompleted(Categorie.alimentation)).toStrictEqual(
      true,
    );
    expect(quizzProfile.getLevel(Categorie.climat)).toStrictEqual(
      DifficultyLevel.L1,
    );
    expect(quizzProfile.isLevelCompleted(Categorie.climat)).toStrictEqual(
      false,
    );
  });
  it('convertToKeyedObject : return raw profil data', () => {
    // GIVEN
    const data = {
      alimentation: {
        level: DifficultyLevel.L1,
        isCompleted: true,
      },
      climat: {
        level: DifficultyLevel.L2,
        isCompleted: false,
      },
      logement: {
        level: DifficultyLevel.L3,
        isCompleted: true,
      },
      loisir: {
        level: DifficultyLevel.L4,
        isCompleted: false,
      },
      consommation: {
        level: DifficultyLevel.L5,
        isCompleted: true,
      },
      dechet: {
        level: DifficultyLevel.L4,
        isCompleted: false,
      },
      transport: {
        level: DifficultyLevel.L3,
        isCompleted: true,
      },
    };
    const profile = new UserQuizzProfile(data);

    // WHEN
    const the_object = profile.getData();

    // THEN
    expect(the_object).toStrictEqual(data);
  });
  it('newLowProfile : init properly new starting profile', () => {
    // WHEN
    const profile = UserQuizzProfile.newLowProfile();

    // THEN
    expect(profile.getData()).toStrictEqual({
      alimentation: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      climat: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      logement: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      loisir: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      consommation: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      dechet: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
      transport: {
        level: DifficultyLevel.L1,
        isCompleted: false,
      },
    });
  });
});
