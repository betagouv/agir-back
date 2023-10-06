import {
  Impact,
  OnboardingData,
  Thematique,
} from '../../../../src/domain/utilisateur/onboardingData';
import { OnboardingResult } from '../../../../src/domain/utilisateur/onboardingResult';

describe('Objet OnboardingData', () => {
  it.skip('converts ok to JSON', () => {
    // GIVEN
    let onboardingResult = new OnboardingResult({} as OnboardingData);
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
});
