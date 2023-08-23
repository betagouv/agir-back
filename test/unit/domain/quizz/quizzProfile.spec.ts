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
  it('new : should build with map as input', () => {
    // GIVEN
    const map = new Map();
    map.set(Categorie.alimentation, 3);

    // WHEN
    const quizzProfile = new QuizzProfile(map);

    // THEN
    expect(quizzProfile.getLevel(Categorie.alimentation)).toEqual(3);
  });
  it('convertToKeyedObject : should build with map as input', () => {
    // GIVEN
    const profile = new QuizzProfile({ alimentation: 3 });

    // WHEN
    const the_object = profile.convertToKeyedObject();

    // THEN
    expect(the_object).toStrictEqual({ alimentation: 3 });
  });
  it('newLowProfile : init properly new starting profile', () => {
    // WHEN
    const profile = QuizzProfile.newLowProfile();

    // THEN
    expect(profile.convertToKeyedObject()).toStrictEqual({
      alimentation: 1,
      climat: 1,
      logement: 1,
      loisir: 1,
      consommation: 1,
      dechet: 1,
      transport: 1,
    });
  });
});
