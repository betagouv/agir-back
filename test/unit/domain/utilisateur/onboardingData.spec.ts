import {
  Chauffage,
  Consommation,
  Impact,
  Onboarding,
  Repas,
  Residence,
  Superficie,
  Transport,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';

const ONBOARDING_DATA = {
  transports: [Transport.moto, Transport.voiture],
  adultes: 1,
  avion: 0,
  chauffage: Chauffage.bois,
  code_postal: '91120',
  commune: 'Palaiseau',
  proprietaire: true,
  enfants: 1,
  consommation: Consommation.jamais,
  repas: Repas.vegan,
  residence: Residence.appartement,
  superficie: Superficie.superficie_150,
};

describe('Objet OnboardingData', () => {
  it('getTransportLevel : renvoie "tres_faible" si tout à zéro', () => {
    // GIVEN
    let onboarding = new Onboarding({ ...ONBOARDING_DATA, transports: [] });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getTransportLevel : renvoie "tres_faible" même si velo, marche , metro', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
      avion: 2,
      transports: [],
    });

    // WHEN
    let levelTranspo = onboarding.getTransportLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getTransportLevel : renvoie "elevé" si un voyage en avion et de la voiture ', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
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
      ...ONBOARDING_DATA,
      repas: Repas.vegan,
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getAlimentationLevel : renvoie "faible" si vege', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      repas: Repas.vege,
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getAlimentationLevel : renvoie "elevé" si de tout', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      repas: Repas.tout,
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getAlimentationLevel : renvoie "tres elevé" si viande', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      repas: Repas.viande,
    });

    // WHEN
    let levelTranspo = onboarding.getAlimentationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });

  it('getConsommationLevel : renvoie "tres faible" si "jamais" de courses', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      consommation: Consommation.jamais,
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getConsommationLevel : renvoie "faible" si secondemain', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      consommation: Consommation.secondemain,
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getConsommationLevel : renvoie "elevé" si raisonnable', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      consommation: Consommation.raisonnable,
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getConsommationLevel : renvoie "tres elevé" si shopping', () => {
    // GIVEN
    let onboarding = new Onboarding({
      ...ONBOARDING_DATA,
      consommation: Consommation.shopping,
    });

    // WHEN
    let levelTranspo = onboarding.getConsommationLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
  it('getLogementLevel : renvoi tres faible si adulte-bois-appart-petit', () => {
    // GIVEN
    let onboarding = {
      ...ONBOARDING_DATA,
      residence: Residence.appartement,
      adultes: 1,
      enfants: 0,
      superficie: Superficie.superficie_35,
      chauffage: Chauffage.bois,
    };
    const onboarding_obj = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding_obj.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_faible);
  });
  it('getLogementLevel : renvoi faible', () => {
    // GIVEN
    let onboarding = {
      ...ONBOARDING_DATA,
      residence: Residence.maison,
      adultes: 2,
      enfants: 2,
      superficie: Superficie.superficie_70,
      chauffage: Chauffage.autre,
    };
    const onboarding_obj = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding_obj.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.faible);
  });
  it('getLogementLevel : renvoi elevé', () => {
    // GIVEN
    let onboarding = {
      ...ONBOARDING_DATA,
      residence: Residence.appartement,
      adultes: 2,
      enfants: 1,
      superficie: Superficie.superficie_100,
      chauffage: Chauffage.gaz,
    };
    const onboarding_obj = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding_obj.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.eleve);
  });
  it('getLogementLevel : renvoi tres elevé', () => {
    // GIVEN
    let onboarding = {
      ...ONBOARDING_DATA,
      residence: Residence.maison,
      adultes: 2,
      enfants: 2,
      superficie: Superficie.superficie_150,
      chauffage: Chauffage.gaz,
    };

    const onboarding_obj = new Onboarding(onboarding);

    // WHEN
    let levelTranspo = onboarding_obj.getLogementLevel();

    // THEN
    expect(levelTranspo).toEqual(Impact.tres_eleve);
  });
});
