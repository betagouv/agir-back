import { Impact, OnboardingData, Thematique } from './onboardingData';

export class OnboardingResult {
  ventilation_par_impacts: Record<Impact, Thematique[]>;
  ventilation_par_thematiques: Record<Thematique, Impact>;

  constructor(data: OnboardingData) {
    this.ventilation_par_thematiques = {
      alimentation: data.getAlimentationLevel(),
      transports: data.getTransportLevel(),
      logement: data.getLogementLevel(),
      consommation: data.getConsommationLevel(),
    };
    this.ventilation_par_impacts = {
      '1': this.listeByImpact(Impact.tres_faible),
      '2': this.listeByImpact(Impact.faible),
      '3': this.listeByImpact(Impact.eleve),
      '4': this.listeByImpact(Impact.tres_eleve),
    };
  }

  public getImpact(thematique: Thematique): Impact {
    return this.ventilation_par_thematiques[thematique];
  }
  public nombreThematiquesAvecImpactSuperieurOuEgalA(
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
  public listThematiquesAvecImpactSuperieurOuEgalA(
    minImpact: Impact,
  ): Thematique[] {
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

  public listThematiquesAvecImpactInferieurA(maxImpact: Impact): Thematique[] {
    let result = [];
    for (let impact = Impact.tres_faible; impact < maxImpact; impact++) {
      result = result.concat(this.ventilation_par_impacts[`${impact}`]);
    }
    return result;
  }

  public trieDecroissant(listThematiques: Thematique[]): Thematique[] {
    let result = [...listThematiques];
    result.sort(
      (a, b) =>
        this.ventilation_par_thematiques[b] -
        this.ventilation_par_thematiques[a],
    );
    return result;
  }

  public getThematiqueNo1SuperieureA(minImpact: Impact): Thematique {
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
    if (maxList.indexOf(Thematique.transports) >= 0)
      return Thematique.transports;
    if (maxList.indexOf(Thematique.alimentation) >= 0)
      return Thematique.alimentation;
    if (maxList.indexOf(Thematique.logement) >= 0) return Thematique.logement;
    if (maxList.indexOf(Thematique.consommation) >= 0)
      return Thematique.consommation;
    return null;
  }

  private listeByImpact(impact: Impact): Thematique[] {
    let result = [];
    if (this.ventilation_par_thematiques.alimentation === impact)
      result.push(Thematique.alimentation);
    if (this.ventilation_par_thematiques.transports === impact)
      result.push(Thematique.transports);
    if (this.ventilation_par_thematiques.logement === impact)
      result.push(Thematique.logement);
    if (this.ventilation_par_thematiques.consommation === impact)
      result.push(Thematique.consommation);
    return result;
  }
}
