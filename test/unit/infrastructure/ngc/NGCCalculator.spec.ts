import { VoitureGabarit } from '../../../../src/domain/equipements/vehicule';
import { NGCCalculator } from '../../../../src/infrastructure/ngc/NGCCalculator';

describe('NGCCalculator', () => {
  it('constructor : no exception', () => {
    //WHEN
    let calculator = new NGCCalculator();
    //THEN
    expect(calculator).toBeDefined();
  });
  it('computeSingleEntry : compute ok single entry, empty situation', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {};
    const entry = 'transport . voiture . empreinte moyenne';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(2588.342745335035);
  });
  it('computeSingleEntry : compute ok single entry, minimal situation', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': { valeur: 11000, unité: 'km/an' },
    };
    const entry = 'transport . voiture . empreinte moyenne';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(2396.046737597163);
  });
  it('computeSingleEntry : compute ok vehicule type info ', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . gabarit': { valeur: VoitureGabarit.petite },
    };
    const entry = 'transport . voiture . empreinte calculée';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(Math.round(response.valueOf() as number)).toEqual(32);
  });
  it('computeSingleEntry : compute ok single entry, complexe situation', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': { valeur: 12000, unité: 'km/an' },
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . voyageurs': {
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
    expect(response).toEqual(7936.708445430233);
  });
  it('computeEntryList : compute ok multiple entries', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'transport . voiture . km': 12000,
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . voyageurs': 2,
      'transport . deux roues . usager': 'non',
      'transport . avion . usager': 'non',
    };
    const entries = [
      'bilan',
      'divers',
      'logement',
      'transport . voiture . empreinte moyenne',
      'alimentation',
      'services sociétaux',
    ];

    //WHEN
    const response = calculator.computeEntryListValues(situation, entries);

    //THEN
    expect(response.size).toEqual(6);
    expect(response.get('bilan')).toEqual(7936.708445430233);
    expect(response.get('divers')).toEqual(1086.544660199586);
    expect(response.get('logement')).toEqual(1481.2354772117592);
    expect(response.get('transport . voiture . empreinte moyenne')).toEqual(
      1533.776046427234,
    );
    expect(response.get('alimentation')).toEqual(2099.9159821);
    expect(response.get('services sociétaux')).toEqual(1474.0267696872584);
  });

  it(`est applicable : indique que la question n'est pas applicable`, () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = { 'transport . voiture . km': 0 };
    const entry = 'transport . voiture . motorisation';

    //WHEN
    const reponse = calculator.estQuestionApplicable(
      {
        //'transport . voiture . km': 100,
      },
      'transport . voiture . motorisation',
    );

    console.log(reponse);
  });
  it.only('listerToutesLesClésDeQuestions : liste toutes les clés', () => {
    //GIVEN
    let calculator = new NGCCalculator();

    //WHEN
    const result = calculator.listerToutesLesClésDeQuestions();
    console.log(result.length);
    //THEN
    console.log(result);
  });
  it(' listeQuestionsAvecConditionApplicabilité : liste toutes les clés de questions avec conditions', () => {
    //GIVEN
    let calculator = new NGCCalculator();

    //WHEN
    const result = calculator.listeQuestionsAvecConditionApplicabilité();

    //THEN
    console.log(result);
  });
});
