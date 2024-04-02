import { ThematiqueOnboarding } from '../../onboarding/onboarding';
import { Impact } from '../../onboarding/onboarding';
import { OnboardingResult } from '../../onboarding/onboardingResult';
import { Versioned } from '../versioned';

export class OnboardingResult_v0 extends Versioned {
  ventilation_par_impacts: Record<Impact, ThematiqueOnboarding[]>;
  ventilation_par_thematiques: Record<ThematiqueOnboarding, Impact>;

  static serialise(domain: OnboardingResult): OnboardingResult_v0 {
    return {
      version: 0,
      ventilation_par_impacts: domain.ventilation_par_impacts,
      ventilation_par_thematiques: domain.ventilation_par_thematiques,
    };
  }
}
