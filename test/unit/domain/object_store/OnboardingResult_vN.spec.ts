import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { OnboardingResult } from '../../../../src/domain/onboarding/onboardingResult';
import { OnboardingResult_v0 } from '../../../../src/domain/object_store/onboardingResult/onboardingResult_v0';
import {
  Consommation,
  Onboarding,
  Repas,
} from '../../../../src/domain/onboarding/onboarding';
import {
  TypeLogement,
  Superficie,
  Chauffage,
} from '../../../../src/domain/logement/logement';
import { TransportQuotidien } from '../../../../src/domain/transport/transport';

describe('OnboardingResult vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.OnboardingResult);

    // WHEN

    const domain = new OnboardingResult(raw);

    // THEN
    expect(domain.ventilation_par_impacts).toBeUndefined();
    expect(domain.ventilation_par_thematiques).toBeUndefined();
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    let domain_start = OnboardingResult.buildFromOnboarding(
      new Onboarding({
        version: 0,
        transports: [TransportQuotidien.voiture],
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
      }),
    );

    // WHEN
    const raw = OnboardingResult_v0.serialise(domain_start);
    const domain_end = new OnboardingResult(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    let domain_start = OnboardingResult.buildFromOnboarding(
      new Onboarding({
        version: 0,
        transports: [TransportQuotidien.voiture],
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
      }),
    );

    // WHEN
    const raw = OnboardingResult_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.OnboardingResult,
    );
    const domain_end = new OnboardingResult(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
