import { OnboardingUsecase } from '../../../src/usecase/onboarding.usecase';

describe('UtilisateurUsecase', () => {
  it('getFractionFromPourcent : correct lower than 50% values', () => {
    // THEN
    expect(OnboardingUsecase.getFractionFromPourcent(10)).toStrictEqual({
      num: 1,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(20)).toStrictEqual({
      num: 1,
      denum: 5,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(25)).toStrictEqual({
      num: 1,
      denum: 4,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(30)).toStrictEqual({
      num: 1,
      denum: 3,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(40)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(45)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(50)).toStrictEqual({
      num: 1,
      denum: 2,
    });
  });
  it('getFractionFromPourcent : correct higher than 50% values', () => {
    // THEN
    expect(OnboardingUsecase.getFractionFromPourcent(55)).toStrictEqual({
      num: 1,
      denum: 2,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(60)).toStrictEqual({
      num: 6,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(70)).toStrictEqual({
      num: 7,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(80)).toStrictEqual({
      num: 8,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(90)).toStrictEqual({
      num: 9,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(95)).toStrictEqual({
      num: 9,
      denum: 10,
    });
    expect(OnboardingUsecase.getFractionFromPourcent(100)).toStrictEqual({
      num: 10,
      denum: 10,
    });
  });
});
