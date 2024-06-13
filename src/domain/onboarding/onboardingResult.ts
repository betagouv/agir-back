import { OnboardingResult_v0 } from '../object_store/onboardingResult/onboardingResult_v0';
import { Impact, Onboarding, ThematiqueOnboarding } from './onboarding';

export class OnboardingResult {
  ventilation_par_impacts: Record<Impact, ThematiqueOnboarding[]>;
  ventilation_par_thematiques: Record<ThematiqueOnboarding, Impact>;

  constructor(data?: OnboardingResult_v0) {
    if (data) {
      this.ventilation_par_thematiques = data.ventilation_par_thematiques;
      this.ventilation_par_impacts = data.ventilation_par_impacts;
    }
  }

  public static buildFromOnboarding(data: Onboarding) {
    if (!data) {
      return new OnboardingResult({
        version: 0,
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.tres_faible,
          consommation: Impact.tres_faible,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.alimentation],
          '3': [ThematiqueOnboarding.alimentation],
          '4': [ThematiqueOnboarding.alimentation],
        },
      });
    }
    const ventilation_par_them = {
      alimentation: data.getAlimentationLevel(),
      transports: data.getTransportLevel(),
      logement: data.getLogementLevel(),
      consommation: data.getConsommationLevel(),
    };
    return new OnboardingResult({
      version: 0,
      ventilation_par_thematiques: ventilation_par_them,
      ventilation_par_impacts: {
        '1': OnboardingResult.listeByImpact(
          Impact.tres_faible,
          ventilation_par_them,
        ),
        '2': OnboardingResult.listeByImpact(
          Impact.faible,
          ventilation_par_them,
        ),
        '3': OnboardingResult.listeByImpact(Impact.eleve, ventilation_par_them),
        '4': OnboardingResult.listeByImpact(
          Impact.tres_eleve,
          ventilation_par_them,
        ),
      },
    });
  }

  public setOnboardingResultData(data: OnboardingResult) {
    this.ventilation_par_thematiques = data.ventilation_par_thematiques;
    this.ventilation_par_impacts = data.ventilation_par_impacts;
  }

  public getImpact?(thematique: ThematiqueOnboarding): Impact {
    return this.ventilation_par_thematiques[thematique];
  }

  public nombreThematiquesAvecImpactSuperieurOuEgalA?(
    minImpact: Impact,
  ): number {
    let result = 0;
    for (
      let impact: number = minImpact;
      impact <= Impact.tres_eleve;
      impact++
    ) {
      result += this.ventilation_par_impacts[`${impact}`].length;
    }
    return result;
  }

  public listThematiquesAvecImpactSuperieurOuEgalA?(
    minImpact: Impact,
  ): ThematiqueOnboarding[] {
    let result = [];
    for (
      let impact: number = minImpact;
      impact <= Impact.tres_eleve;
      impact++
    ) {
      result = result.concat(this.ventilation_par_impacts[`${impact}`]);
    }
    return result;
  }

  public listThematiquesAvecImpactInferieurA?(
    maxImpact: Impact,
  ): ThematiqueOnboarding[] {
    let result = [];
    for (let impact = Impact.tres_faible; impact < maxImpact; impact++) {
      result = result.concat(this.ventilation_par_impacts[`${impact}`]);
    }
    return result;
  }

  public trieDecroissant?(
    listThematiques: ThematiqueOnboarding[],
  ): ThematiqueOnboarding[] {
    let result = [...listThematiques];
    result.sort(
      (a, b) =>
        this.ventilation_par_thematiques[b] -
        this.ventilation_par_thematiques[a],
    );
    return result;
  }

  public getThematiqueNo1SuperieureA?(minImpact: Impact): ThematiqueOnboarding {
    const list = this.listThematiquesAvecImpactSuperieurOuEgalA(minImpact);

    if (list.length === 0) return null;

    list.sort(
      (a, b) =>
        this.ventilation_par_thematiques[b] -
        this.ventilation_par_thematiques[a],
    );

    const maxImpact = this.ventilation_par_thematiques[list[0]];
    const maxList = [];
    let index = 0;

    while (
      this.ventilation_par_thematiques[list[index]] === maxImpact &&
      index < list.length
    ) {
      maxList.push(list[index]);
      index++;
    }

    if (maxList.indexOf(ThematiqueOnboarding.transports) >= 0)
      return ThematiqueOnboarding.transports;
    if (maxList.indexOf(ThematiqueOnboarding.alimentation) >= 0)
      return ThematiqueOnboarding.alimentation;
    if (maxList.indexOf(ThematiqueOnboarding.logement) >= 0)
      return ThematiqueOnboarding.logement;
    if (maxList.indexOf(ThematiqueOnboarding.consommation) >= 0)
      return ThematiqueOnboarding.consommation;
    return null;
  }

  private static listeByImpact?(
    impact: Impact,
    ventilation_par_thematiques: Record<ThematiqueOnboarding, Impact>,
  ): ThematiqueOnboarding[] {
    let result = [];
    if (ventilation_par_thematiques.alimentation === impact)
      result.push(ThematiqueOnboarding.alimentation);
    if (ventilation_par_thematiques.transports === impact)
      result.push(ThematiqueOnboarding.transports);
    if (ventilation_par_thematiques.logement === impact)
      result.push(ThematiqueOnboarding.logement);
    if (ventilation_par_thematiques.consommation === impact)
      result.push(ThematiqueOnboarding.consommation);
    return result;
  }
}
