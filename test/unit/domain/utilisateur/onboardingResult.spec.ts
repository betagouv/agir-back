import {
  Impact,
  Onboarding,
  Thematique,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';
import { OnboardingResult } from '../../../../src/domain/utilisateur/onboarding/onboardingResult';

const ONBOARDING_1_2_3_4 = {
  transports: ['velo', 'voiture'],
  avion: 2,
  adultes: 2,
  enfants: 2,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_35',
  chauffage: 'bois',
  repas: 'vege',
  consommation: 'raisonnable',
};

describe('Objet OnboardingData', () => {
  it('converts ok to JSON', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };

    // WHEN
    let json = JSON.stringify(onboardingResult);

    // THEN
    expect(json).toEqual(
      '{"ventilation_par_thematiques":{"alimentation":1,"transports":2,"logement":3,"consommation":4},"ventilation_par_impacts":{"1":["alimentation"],"2":["transports"],"3":["logement"],"4":["consommation"]}}',
    );
  });
  it('converts ok to JSON', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };

    // WHEN
    let json = JSON.stringify(onboardingResult);

    // THEN
    expect(json).toEqual(
      '{"ventilation_par_thematiques":{"alimentation":1,"transports":2,"logement":3,"consommation":4},"ventilation_par_impacts":{"1":["alimentation"],"2":["transports"],"3":["logement"],"4":["consommation"]}}',
    );
  });
  it('builds ok basic impact', () => {
    // WHEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    // THEN
    expect(onboardingResult.ventilation_par_thematiques).toStrictEqual({
      alimentation: Impact.faible,
      transports: Impact.tres_eleve,
      logement: Impact.tres_faible,
      consommation: Impact.eleve,
    });
    expect(onboardingResult.ventilation_par_impacts).toStrictEqual({
      '1': [Thematique.logement],
      '2': [Thematique.alimentation],
      '3': [Thematique.consommation],
      '4': [Thematique.transports],
    });
  });
  it('regroupe correctement par impacts similaires', () => {
    // WHEN
    let onboardingResult = new OnboardingResult(
      new Onboarding({
        transports: ['velo'],
        avion: 2,
        adultes: 2,
        enfants: 2,
        residence: 'appartement',
        proprietaire: true,
        superficie: 'superficie_35',
        chauffage: 'bois',
        repas: 'vegan',
        consommation: 'raisonnable',
      }),
    );

    // THEN
    expect(onboardingResult.ventilation_par_impacts).toStrictEqual({
      '1': [Thematique.alimentation, Thematique.logement],
      '2': [],
      '3': [Thematique.transports, Thematique.consommation],
      '4': [],
    });
  });
  it('listThematiquesAvecImpactInferieurA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };
    // WHEN
    const N1 = onboardingResult.listThematiquesAvecImpactInferieurA(
      Impact.tres_faible,
    );
    const N2 = onboardingResult.listThematiquesAvecImpactInferieurA(
      Impact.faible,
    );
    const N3 = onboardingResult.listThematiquesAvecImpactInferieurA(
      Impact.eleve,
    );
    const N4 = onboardingResult.listThematiquesAvecImpactInferieurA(
      Impact.tres_eleve,
    );

    // THEN
    expect(N1).toStrictEqual([]);
    expect(N2).toStrictEqual([Thematique.alimentation]);
    expect(N3).toStrictEqual([Thematique.alimentation, Thematique.transports]);
    expect(N4).toStrictEqual([
      Thematique.alimentation,
      Thematique.transports,
      Thematique.logement,
    ]);
  });
  it('listThematiquesAvecImpactSuperieurOuEgalA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };
    // WHEN
    const N1 = onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_faible,
    );
    const N2 = onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
      Impact.faible,
    );
    const N3 = onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
      Impact.eleve,
    );
    const N4 = onboardingResult.listThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_eleve,
    );

    // THEN
    expect(N1).toStrictEqual([
      Thematique.alimentation,
      Thematique.transports,
      Thematique.logement,
      Thematique.consommation,
    ]);
    expect(N2).toStrictEqual([
      Thematique.transports,
      Thematique.logement,
      Thematique.consommation,
    ]);
    expect(N3).toStrictEqual([Thematique.logement, Thematique.consommation]);
    expect(N4).toStrictEqual([Thematique.consommation]);
  });
  it('nombreThematiquesAvecImpactSuperieurOuEgalA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };
    // WHEN
    const N1 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_faible,
    );
    const N2 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.faible,
    );
    const N3 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.eleve,
    );
    const N4 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_eleve,
    );

    // THEN
    expect(N1).toEqual(4);
    expect(N2).toEqual(3);
    expect(N3).toEqual(2);
    expect(N4).toEqual(1);
  });
  it('nombreThematiquesAvecImpactSuperieurOuEgalA : compte correctement les regroupements', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation, Thematique.transports],
      '2': [],
      '3': [Thematique.logement, Thematique.consommation],
      '4': [],
    };

    // WHEN
    const N1 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_faible,
    );
    const N2 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.faible,
    );
    const N3 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.eleve,
    );
    const N4 = onboardingResult.nombreThematiquesAvecImpactSuperieurOuEgalA(
      Impact.tres_eleve,
    );

    // THEN
    expect(N1).toEqual(4);
    expect(N2).toEqual(2);
    expect(N3).toEqual(2);
    expect(N4).toEqual(0);
  });
  it('trieCroissaint : tir thematiques par impact', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };
    // WHEN
    const result = onboardingResult.trieDecroissant([
      Thematique.transports,
      Thematique.consommation,
      Thematique.logement,
      Thematique.alimentation,
    ]);

    // THEN
    expect(result).toStrictEqual([
      Thematique.consommation,
      Thematique.logement,
      Thematique.transports,
      Thematique.alimentation,
    ]);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal supérieur à X', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [Thematique.alimentation],
      '2': [Thematique.transports],
      '3': [Thematique.logement],
      '4': [Thematique.consommation],
    };
    // WHEN
    const result_tres_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_eleve,
    );
    const result_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.eleve,
    );
    const result_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );
    const result_tres_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_faible,
    );

    // THEN
    expect(result_tres_eleve).toEqual(Thematique.consommation);
    expect(result_eleve).toEqual(Thematique.consommation);
    expect(result_faible).toEqual(Thematique.consommation);
    expect(result_tres_faible).toEqual(Thematique.consommation);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #Transport', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.eleve,
      transports: Impact.eleve,
      logement: Impact.eleve,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [],
      '2': [],
      '3': [
        Thematique.logement,
        Thematique.consommation,
        Thematique.alimentation,
        Thematique.transports,
      ],
      '4': [],
    };
    // WHEN
    const result_tres_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_eleve,
    );
    const result_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.eleve,
    );
    const result_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );
    const result_tres_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_faible,
    );

    // THEN
    expect(result_tres_eleve).toEqual(null);
    expect(result_eleve).toEqual(Thematique.transports);
    expect(result_faible).toEqual(Thematique.transports);
    expect(result_tres_faible).toEqual(Thematique.transports);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #alimentation', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.eleve,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [],
      '2': [Thematique.transports],
      '3': [
        Thematique.logement,
        Thematique.consommation,
        Thematique.alimentation,
      ],
      '4': [],
    };
    // WHEN
    const result_tres_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_eleve,
    );
    const result_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.eleve,
    );
    const result_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );
    const result_tres_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_faible,
    );

    // THEN
    expect(result_tres_eleve).toEqual(null);
    expect(result_eleve).toEqual(Thematique.alimentation);
    expect(result_faible).toEqual(Thematique.alimentation);
    expect(result_tres_faible).toEqual(Thematique.alimentation);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #logement', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [],
      '2': [Thematique.transports, Thematique.alimentation],
      '3': [Thematique.logement, Thematique.consommation],
      '4': [],
    };
    // WHEN
    const result_tres_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_eleve,
    );
    const result_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.eleve,
    );
    const result_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );
    const result_tres_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_faible,
    );

    // THEN
    expect(result_tres_eleve).toEqual(null);
    expect(result_eleve).toEqual(Thematique.logement);
    expect(result_faible).toEqual(Thematique.logement);
    expect(result_tres_faible).toEqual(Thematique.logement);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #consommation', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.faible,
      transports: Impact.faible,
      logement: Impact.faible,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [],
      '2': [
        Thematique.transports,
        Thematique.alimentation,
        Thematique.logement,
      ],
      '3': [Thematique.consommation],
      '4': [],
    };
    // WHEN
    const result_tres_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_eleve,
    );
    const result_eleve = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.eleve,
    );
    const result_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.faible,
    );
    const result_tres_faible = onboardingResult.getThematiqueNo1SuperieureA(
      Impact.tres_faible,
    );

    // THEN
    expect(result_tres_eleve).toEqual(null);
    expect(result_eleve).toEqual(Thematique.consommation);
    expect(result_faible).toEqual(Thematique.consommation);
    expect(result_tres_faible).toEqual(Thematique.consommation);
  });
});
