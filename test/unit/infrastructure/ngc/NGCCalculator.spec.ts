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
    expect(response).toEqual(2199.540741358343);
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
    expect(response).toEqual(1983.1924717165384);
  });
  it.skip('computeSingleEntry : compute ok vehicule type info ', () => {
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
    expect(response).toEqual(7661.143979107765);
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
    expect(response.get('bilan')).toEqual(7661.143979107765);
    expect(response.get('divers')).toEqual(1079.0454437235896);
    expect(response.get('logement')).toEqual(1477.82343812085);
    expect(response.get('transport . voiture . empreinte moyenne')).toEqual(
      1298.089617850825,
    );
    expect(response.get('alimentation')).toEqual(2094.1568221);
    expect(response.get('services sociétaux')).toEqual(1450.9052263863641);
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
  });
  it('listerToutesLesClésDeQuestions : liste toutes les clés', () => {
    //GIVEN
    let calculator = new NGCCalculator();

    //WHEN
    const result = calculator.listerToutesLesClésDeQuestions();
    //THEN
  });
  it(' listeQuestionsAvecConditionApplicabilité : liste toutes les clés de questions avec conditions', () => {
    //GIVEN
    let calculator = new NGCCalculator();

    //WHEN
    const result = calculator.listeQuestionsAvecConditionApplicabilité();

    //THEN
  });
});
