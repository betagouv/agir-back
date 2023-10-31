import {
  Impact,
  Onboarding,
  Transport,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';

describe('Objet OnboardingData', () => {
  it('getTransportLevel : renvoie "tres_faible" si tout à zéro', () => {
    // GIVEN
    let onboarding = new Onboarding({
      transports: [],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getTransportLevel : renvoie "tres_faible" même si velo, marche , metro', () => {
    // GIVEN
    let onboarding = new Onboarding({
      transports: [Transport.pied, Transport.velo, Transport.commun],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getTransportLevel : renvoie "faible" si moto seule', () => {
    // GIVEN
    let onboarding = new Onboarding({
      transports: [Transport.moto],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getTransportLevel : renvoie "elevé" si voiture seule ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      transports: [Transport.voiture],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getTransportLevel : renvoie "elevé" si un voyage en avion ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      avion: 1,
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getTransportLevel : renvoie "elevé" si 2 voyages en avion ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      avion: 2,
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getTransportLevel : renvoie "elevé" si un voyage en avion et de la voiture ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      avion: 1,
      transports: [Transport.voiture],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getTransportLevel : renvoie "tres elevé" si 2 voyages en avion et de la voiture ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      avion: 2,
      transports: [Transport.voiture],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getTransportLevel : renvoie "tres elevé" si 3 voyages en avion', () => {
    // GIVEN
    let onboarding = new Onboarding({
      avion: 3,
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getAlimentationLevel : renvoie "tres faible" si vegan', () => {
    // GIVEN
    let onboarding = new Onboarding({
      repas: 'vegan',
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getAlimentationLevel : renvoie "faible" si vege', () => {
    // GIVEN
    let onboarding = new Onboarding({
      repas: 'vege',
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getAlimentationLevel : renvoie "elevé" si de tout', () => {
    // GIVEN
    let onboarding = new Onboarding({
      repas: 'tout',
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getAlimentationLevel : renvoie "tres elevé" si viande', () => {
    // GIVEN
    let onboarding = new Onboarding({
      repas: 'viande',
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });

  it('getConsommationLevel : renvoie "tres faible" si "jamais" de courses', () => {
    // GIVEN
    let onboarding = new Onboarding({
      consommation: 'jamais',
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getConsommationLevel : renvoie "faible" si secondemain', () => {
    // GIVEN
    let onboarding = new Onboarding({
      consommation: 'secondemain',
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getConsommationLevel : renvoie "elevé" si raisonnable', () => {
    // GIVEN
    let onboarding = new Onboarding({
      consommation: 'raisonnable',
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getConsommationLevel : renvoie "tres elevé" si shopping', () => {
    // GIVEN
    let onboarding = new Onboarding({
      consommation: 'shopping',
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getConsommationLevel : renvoie tres_eleve si valeur non connue', () => {
    // GIVEN
    let onboarding = new Onboarding({
      consommation: 'XXX',
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getLogementLevel : renvoie tres_eleve si valeur non connue', () => {
    // GIVEN
    let onboarding = new Onboarding({
      residence: 'XXX',
    });

    // WHEN
    let levelTranspo = onboarding.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getLogementLevel : renvoi tres faible si adulte-bois-appart-petit', () => {
    // GIVEN
    let onboarding = {
      residence: 'appartement',
      adultes: 1,
      enfants: 0,
      superficie: 'superficie_35',
      chauffage: 'bois',
    } as Onboarding;
    onboarding = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getLogementLevel : renvoi faible', () => {
    // GIVEN
    let onboarding = {
      residence: 'maison',
      adultes: 2,
      enfants: 2,
      superficie: 'superficie_70',
      chauffage: 'autre',
    } as Onboarding;
    onboarding = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getLogementLevel : renvoi elevé', () => {
    // GIVEN
    let onboarding = {
      residence: 'appartement',
      adultes: 2,
      enfants: 1,
      superficie: 'superficie_100',
      chauffage: 'gaz',
    } as Onboarding;
    onboarding = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getLogementLevel : renvoi tres elevé', () => {
    // GIVEN
    let onboarding = {
      residence: 'maison',
      adultes: 2,
      enfants: 2,
      superficie: 'superficie_150',
      chauffage: 'gaz',
    } as Onboarding;
    onboarding = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
});
