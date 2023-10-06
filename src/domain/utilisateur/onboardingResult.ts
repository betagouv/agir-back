import { Impact, OnboardingData, Thematique } from './onboardingData';

export class OnboardingResult {
  constructor(data: OnboardingData) {
    this.ventilation_par_thematiques = {
      alimentation: data.getAlimentationLevel(),
      transports: data.getTransportLevel(),
      logement: data.getLogementLevel(),
      consommation: data.getConsommationLevel(),
    };
    /*
    this.ventilation_par_impacts = {
        '1': 
    }
    */
  }

  private listByImpact(): Thematique[] {
    return null;
  }
  ventilation_par_impacts: Record<Impact, Thematique[]>;
  ventilation_par_thematiques: Record<Thematique, Impact>;
}
