import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import {
  Consommation,
  Onboarding,
  Repas,
  TransportOnboarding,
} from '../../../../src/domain/utilisateur/onboarding/onboarding';
import { Onboarding_v0 } from '../../../../src/domain/object_store/Onboarding/onboarding_v0';
import {
  TypeLogement,
  Superficie,
  Chauffage,
} from '../../../../src/domain/utilisateur/logement';

describe('Onboarding vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.Onboarding);

    // WHEN

    const domain = new Onboarding(raw);

    // THEN
    expect(domain.adultes).toEqual(undefined);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    let domain_start = new Onboarding({
      version: 0,
      transports: [TransportOnboarding.voiture],
      avion: 2,
      code_postal: '91120',
      adultes: 2,
      enfants: 1,
      residence: TypeLogement.maison,
      proprietaire: true,
      superficie: Superficie.superficie_150,
      chauffage: Chauffage.bois,
      repas: Repas.viande,
      consommation: Consommation.raisonnable,
      commune: 'PALAISEAU',
    });

    // WHEN
    const raw = Onboarding_v0.serialise(domain_start);
    const domain_end = new Onboarding(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    let domain_start = new Onboarding({
      version: 0,
      transports: [TransportOnboarding.voiture],
      avion: 2,
      code_postal: '91120',
      adultes: 2,
      enfants: 1,
      residence: TypeLogement.maison,
      proprietaire: true,
      superficie: Superficie.superficie_150,
      chauffage: Chauffage.bois,
      repas: Repas.viande,
      consommation: Consommation.raisonnable,
      commune: 'PALAISEAU',
    });

    // WHEN
    const raw = Onboarding_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Onboarding);
    const domain_end = new Onboarding(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
