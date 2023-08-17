import { NGCCalculator } from '../../../../src/infrastructure/ngc/NGCCalculator';

describe('NGCCalculator', () => {
  it('constructor : no exception', () => {
    //WHEN
    let calculator = new NGCCalculator();
    //THEN
    expect(calculator).toBeDefined();
  });
  it('computeSingleEntry : compute ok single entry, minimal situation', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': { valeur: 12000, unité: 'km / an' },
    };
    const entry = 'bilan';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(8398.594521380714);
  });
  it('computeSingleEntry : compute ok single entry, complexe situation', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': { valeur: 12000, unité: 'km / an' },
      'transport . voiture . propriétaire': 'non',
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . saisie voyageurs': {
        valeur: 2,
        unité: 'voyageurs',
      },
      'transport . deux roues . usager': 'non',
      'transport . avion . usager': 'non',
    };
    const entry = 'bilan';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(6770.336671393776);
  });
  it('computeEntryList : compute ok multiple entries', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': 12000,
      'transport . voiture . propriétaire': 'non',
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . saisie voyageurs': 2,
      'transport . deux roues . usager': 'non',
      'transport . avion . usager': 'non',
    };
    const entries = [
      'bilan',
      'divers',
      'logement',
      'transport . empreinte',
      'alimentation',
      'services sociétaux',
    ];

    //WHEN
    const response = calculator.computeEntryListValues(situation, entries);

    //THEN
    expect(response.size).toEqual(6);
    expect(response.get('bilan')).toEqual(6770.336671393776);
    expect(response.get('divers')).toEqual(852.8584599753638);
    expect(response.get('logement')).toEqual(1424.3853917865213);
    expect(response.get('transport . empreinte')).toEqual(905.7128413055185);
    expect(response.get('alimentation')).toEqual(2033.7441687666667);
    expect(response.get('services sociétaux')).toEqual(1553.6358095597056);
  });
});