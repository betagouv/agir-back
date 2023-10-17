import { UtilisateurUsecase } from '../../../src/usecase/utilisateur.usecase';

describe('UtilisateurUsecase', () => {
  it('getFractionFromPourcent : correct lower than 50% values', () => {
    // THEN
    expect(UtilisateurUsecase.getFractionFromPourcent(10)).toStrictEqual({
      num: 1,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(20)).toStrictEqual({
      num: 1,
      denum: 5,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(25)).toStrictEqual({
      num: 1,
      denum: 4,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(30)).toStrictEqual({
      num: 1,
      denum: 3,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(40)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(45)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(50)).toStrictEqual({
      num: 1,
      denum: 2,
    });
  });
  it('getFractionFromPourcent : correct higher than 50% values', () => {
    // THEN
    expect(UtilisateurUsecase.getFractionFromPourcent(55)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(60)).toStrictEqual({
      num: 6,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(70)).toStrictEqual({
      num: 7,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(80)).toStrictEqual({
      num: 8,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(90)).toStrictEqual({
      num: 9,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(95)).toStrictEqual({
      num: 9,
      denum: 10,
    });
    expect(UtilisateurUsecase.getFractionFromPourcent(100)).toStrictEqual({
      num: 10,
      denum: 10,
    });
  });
});
