import { TransportQuotidien } from '../../../../src/domain/utilisateur/transport';
import {
  TypeLogement,
  Superficie,
  Chauffage,
} from '../../../../src/domain/utilisateur/logement';
import {
  Consommation,
  Impact,
  Onboarding,
  Repas,
  ThematiqueOnboarding,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';
import { OnboardingResult } from '../../../../src/domain/utilisateur/onboarding/onboardingResult';

const ONBOARDING_1_2_3_4 = {
  version: 0,
  transports: [TransportQuotidien.velo, TransportQuotidien.voiture],
  avion: 2,
  adultes: 2,
  enfants: 2,
  residence: TypeLogement.maison,
  proprietaire: true,
  superficie: Superficie.superficie_35,
  chauffage: Chauffage.bois,
  repas: Repas.vege,
  consommation: Consommation.raisonnable,
  code_postal: '91120',
  commune: 'Palaiseau',
};

describe('Objet OnboardingData', () => {
  it('converts ok to JSON', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
    let onboardingResult = OnboardingResult.buildFromOnboarding(
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
      '1': [ThematiqueOnboarding.logement],
      '2': [ThematiqueOnboarding.alimentation],
      '3': [ThematiqueOnboarding.consommation],
      '4': [ThematiqueOnboarding.transports],
    });
  });
  it('regroupe correctement par impacts similaires', () => {
    // WHEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding({
        version: 0,
        transports: [TransportQuotidien.velo],
        avion: 2,
        adultes: 2,
        enfants: 2,
        residence: TypeLogement.appartement,
        proprietaire: true,
        superficie: Superficie.superficie_35,
        chauffage: Chauffage.bois,
        repas: Repas.vegan,
        consommation: Consommation.raisonnable,
        code_postal: '91120',
        commune: 'Palaiseau',
      }),
    );

    // THEN
    expect(onboardingResult.ventilation_par_impacts).toStrictEqual({
      '1': [ThematiqueOnboarding.alimentation, ThematiqueOnboarding.logement],
      '2': [],
      '3': [ThematiqueOnboarding.transports, ThematiqueOnboarding.consommation],
      '4': [],
    });
  });
  it('listThematiquesAvecImpactInferieurA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
    expect(N2).toStrictEqual([ThematiqueOnboarding.alimentation]);
    expect(N3).toStrictEqual([
      ThematiqueOnboarding.alimentation,
      ThematiqueOnboarding.transports,
    ]);
    expect(N4).toStrictEqual([
      ThematiqueOnboarding.alimentation,
      ThematiqueOnboarding.transports,
      ThematiqueOnboarding.logement,
    ]);
  });
  it('listThematiquesAvecImpactSuperieurOuEgalA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
      ThematiqueOnboarding.alimentation,
      ThematiqueOnboarding.transports,
      ThematiqueOnboarding.logement,
      ThematiqueOnboarding.consommation,
    ]);
    expect(N2).toStrictEqual([
      ThematiqueOnboarding.transports,
      ThematiqueOnboarding.logement,
      ThematiqueOnboarding.consommation,
    ]);
    expect(N3).toStrictEqual([
      ThematiqueOnboarding.logement,
      ThematiqueOnboarding.consommation,
    ]);
    expect(N4).toStrictEqual([ThematiqueOnboarding.consommation]);
  });
  it('nombreThematiquesAvecImpactSuperieurOuEgalA : compte le bon nombre', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );

    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation, ThematiqueOnboarding.transports],
      '2': [],
      '3': [ThematiqueOnboarding.logement, ThematiqueOnboarding.consommation],
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
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
    };
    // WHEN
    const result = onboardingResult.trieDecroissant([
      ThematiqueOnboarding.transports,
      ThematiqueOnboarding.consommation,
      ThematiqueOnboarding.logement,
      ThematiqueOnboarding.alimentation,
    ]);

    // THEN
    expect(result).toStrictEqual([
      ThematiqueOnboarding.consommation,
      ThematiqueOnboarding.logement,
      ThematiqueOnboarding.transports,
      ThematiqueOnboarding.alimentation,
    ]);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal supérieur à X', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
      new Onboarding(ONBOARDING_1_2_3_4),
    );
    onboardingResult.ventilation_par_thematiques = {
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    };
    onboardingResult.ventilation_par_impacts = {
      '1': [ThematiqueOnboarding.alimentation],
      '2': [ThematiqueOnboarding.transports],
      '3': [ThematiqueOnboarding.logement],
      '4': [ThematiqueOnboarding.consommation],
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
    expect(result_tres_eleve).toEqual(ThematiqueOnboarding.consommation);
    expect(result_eleve).toEqual(ThematiqueOnboarding.consommation);
    expect(result_faible).toEqual(ThematiqueOnboarding.consommation);
    expect(result_tres_faible).toEqual(ThematiqueOnboarding.consommation);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #Transport', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
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
        ThematiqueOnboarding.logement,
        ThematiqueOnboarding.consommation,
        ThematiqueOnboarding.alimentation,
        ThematiqueOnboarding.transports,
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
    expect(result_eleve).toEqual(ThematiqueOnboarding.transports);
    expect(result_faible).toEqual(ThematiqueOnboarding.transports);
    expect(result_tres_faible).toEqual(ThematiqueOnboarding.transports);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #alimentation', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
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
      '2': [ThematiqueOnboarding.transports],
      '3': [
        ThematiqueOnboarding.logement,
        ThematiqueOnboarding.consommation,
        ThematiqueOnboarding.alimentation,
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
    expect(result_eleve).toEqual(ThematiqueOnboarding.alimentation);
    expect(result_faible).toEqual(ThematiqueOnboarding.alimentation);
    expect(result_tres_faible).toEqual(ThematiqueOnboarding.alimentation);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #logement', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
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
      '2': [ThematiqueOnboarding.transports, ThematiqueOnboarding.alimentation],
      '3': [ThematiqueOnboarding.logement, ThematiqueOnboarding.consommation],
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
    expect(result_eleve).toEqual(ThematiqueOnboarding.logement);
    expect(result_faible).toEqual(ThematiqueOnboarding.logement);
    expect(result_tres_faible).toEqual(ThematiqueOnboarding.logement);
  });
  it('getThematiqueNo1SuperieureA : renvoie la bonne thématique maximal d ordre fonctionnel attendu #consommation', () => {
    // GIVEN
    let onboardingResult = OnboardingResult.buildFromOnboarding(
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
        ThematiqueOnboarding.transports,
        ThematiqueOnboarding.alimentation,
        ThematiqueOnboarding.logement,
      ],
      '3': [ThematiqueOnboarding.consommation],
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
    expect(result_eleve).toEqual(ThematiqueOnboarding.consommation);
    expect(result_faible).toEqual(ThematiqueOnboarding.consommation);
    expect(result_tres_faible).toEqual(ThematiqueOnboarding.consommation);
  });
});
