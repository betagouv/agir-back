import { Categorie } from '../../../../src/domain/categorie';
import { QuizzProfile } from '../../../../src/domain/quizz/quizzProfile';

describe('QuizzProfile', () => {
  it('new : should build with uncomplete level data', () => {
    // GIVEN
    const levels = { alimentation: 1, climat: 2 };

    // WHEN
    const quizzProfile = new QuizzProfile(levels);

    // THEN
    expect(quizzProfile.getLevel(Categorie.climat)).toEqual(2);
    expect(quizzProfile.getLevel(Categorie.alimentation)).toEqual(1);
    expect(quizzProfile.getLevel(Categorie.consommation)).toBeUndefined();
  });
});
