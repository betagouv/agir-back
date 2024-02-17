import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { TestUtil } from '../../../../test/TestUtil';
import {
  Chauffage,
  Consommation,
  Impact,
  Onboarding,
  Repas,
  Residence,
  Superficie,
  TransportOnboarding,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';

const ONBOARDING_DATA = {
  transports: [TransportOnboarding.moto, TransportOnboarding.voiture],
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

describe('Objet Utilisateur', () => {
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur reel si presente', () => {
    // GIVEN
    let utilisateur = new Utilisateur(TestUtil.utilisateurData({ parts: 3 }));

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(3);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {
          adultes: 3,
          enfants: 3,
        },
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(6);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie la valeur adulte + 0.5 x enfants si parts null', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {
          adultes: 3,
          enfants: 2,
        },
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(4);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie 1 si tout null', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {
          adultes: null,
          enfants: null,
        },
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(1);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie 1 si tout null et absent', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {},
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(1);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie adultes seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {
          adultes: 5,
          enfants: null,
        },
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(5);
  });
  it('getNombrePartsFiscalesOuEstimee : renvoie enfants seul', () => {
    // GIVEN
    let utilisateur = new Utilisateur(
      TestUtil.utilisateurData({
        parts: null,
        onboardingData: {
          adultes: null,
          enfants: 4,
        },
      }),
    );

    // WHEN
    const parts = utilisateur.getNombrePartsFiscalesOuEstimee();

    // THEN
    expect(parts).toEqual(4);
  });
});
