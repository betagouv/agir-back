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
    expect(response).toEqual(1568.5480530854577);
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
    expect(response).toEqual(1990.0803695420266);
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
    expect(response).toEqual(8442.02626567427);
  });
  it('computeSingleEntry : Cas du photovlotaique', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation1 = {
      'logement . électricité . photovoltaique . présent': 'non',
    };
    const situation2 = {
      'logement . électricité . photovoltaique . présent': 'oui',
    };
    const entry = 'bilan';

    //WHEN
    const response1 = calculator.computeSingleEntryValue(situation1, entry);
    const response2 = calculator.computeSingleEntryValue(situation2, entry);

    //THEN
    expect(response1 as number).toBeGreaterThan(response2 as number);
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
    expect(response.get('bilan')).toEqual(8442.02626567427);
    expect(response.get('divers')).toEqual(1149.8963528144989);
    expect(response.get('logement')).toEqual(2160.200464307907);
    expect(response.get('transport . voiture . empreinte moyenne')).toEqual(
      1297.8253327911443,
    );
    expect(response.get('alimentation')).toEqual(2328.7004821);
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

  it('computeEntryListValues : situation a probleme', () => {
    //GIVEN
    let calculator = new NGCCalculator();
    const situation = {
      'alimentation . local . consommation': '"souvent"',
      'alimentation . déchets . quantité jetée': "'base'",
      'alimentation . plats . viande blanche . nombre': '4',
      'alimentation . plats . poisson blanc . nombre': '1',
      'alimentation . plats . poisson gras . nombre': '1',
      'alimentation . plats . végétarien . nombre': '7',
      'alimentation . plats . végétalien . nombre': '1',
      'alimentation . plats . viande rouge . nombre': '0',
      'alimentation . déchets . gestes . gaspillage alimentaire . présent':
        'non',
      'alimentation . déchets . gestes . stop pub . présent': 'non',
      'alimentation . déchets . gestes . acheter en vrac . présent': 'oui',
      'alimentation . boisson . alcool . litres': '233',
      'alimentation . de saison . consommation': '"parfois"',
      'alimentation . déchets . gestes . compostage biodéchets . présent':
        'non',
      /*
      'alimentation . plats': '"je mange beaucoup de viande"',
        */
    };
    const entries = ['alimentation'];

    //WHEN
    const response = calculator.computeEntryListValues(situation, entries);

    //THEN
    expect(response.size).toEqual(1);
    expect(response.get('alimentation')).not.toEqual(NaN);
  });
});
