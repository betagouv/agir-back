import { RegleNGC } from 'src/domain/bilan/bilanCarbone';
import { NGCCalculator } from '../../../../src/infrastructure/ngc/NGCCalculator';

describe('NGCCalculator', () => {
  const calculator = new NGCCalculator();

  it('constructor : no exception', () => {
    //WHEN
    //THEN
    expect(calculator).toBeDefined();
  });

  // Needed until https://github.com/incubateur-ademe/nosgestesclimat/pull/2567 is published.
  it('computeSingleEntry : bug with logement . type', () => {
    //GIVEN
    const situation = {
      'logement . type': "'maison'",
    };
    const entry = 'bilan';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(9172.002002283767);
  });

  it('computeSingleEntry : compute ok single entry, empty situation', () => {
    //GIVEN
    const situation = {};
    const entry = 'transport . voiture . empreinte moyenne';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(1685.5359196330212);
  });

  it('computeSingleEntry : compute ok single entry, minimal situation', () => {
    //GIVEN
    const situation = {
      'transport . voiture . km': { valeur: 11000, unité: 'km/an' },
    };
    const entry = 'transport . voiture . empreinte moyenne';

    //WHEN
    const response = calculator.computeSingleEntryValue(situation, entry);

    //THEN
    expect(response).toEqual(2121.020354014107);
  });

  it('computeSingleEntry : compute ok single entry, complexe situation', () => {
    //GIVEN
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
    expect(response).toEqual(8515.095807644026);
  });

  it('computeSingleEntry : Cas du photovlotaique', () => {
    //GIVEN
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
    const situation = {
      'transport . voiture . km': 12000,
      'transport . voiture . gabarit': "'VUL'",
      'transport . voiture . motorisation': "'électrique'",
      'transport . voiture . voyageurs': 2,
      'transport . deux roues . usager': 'non',
      'transport . avion . usager': 'non',
    };
    const entries: RegleNGC[] = [
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
    expect(response.get('bilan')).toEqual(8515.095807644026);
    expect(response.get('divers')).toEqual(989.0602932841089);
    expect(response.get('logement')).toEqual(2159.945192079794);
    expect(response.get('transport . voiture . empreinte moyenne')).toEqual(
      1816.9975065194033,
    );
    expect(response.get('alimentation')).toEqual(2043.6891821);
    expect(response.get('services sociétaux')).toEqual(1450.9052263863641);
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
    const entries: RegleNGC[] = ['alimentation'];

    //WHEN
    const response = calculator.computeEntryListValues(situation, entries);

    //THEN
    expect(response.size).toEqual(1);
    expect(response.get('alimentation')).not.toEqual(NaN);
  });

  describe('setSituationMiseAJour', () => {
    const engine = NGCCalculator.createNewNGCPublicodesEngine();

    test('situation vide', () => {
      const updatedEngine = NGCCalculator.setSituationAvecMigration(
        engine.shallowCopy(),
        {},
      );

      expect(updatedEngine.getSituation()).toEqual({});
    });

    test('situation non à jour', () => {
      const updatedEngine = NGCCalculator.setSituationAvecMigration(
        engine.shallowCopy(),
        {
          'transport . deux roues . type': "'thermique'",
          // @ts-ignore : les clés sont volontairement incorrectes pour tester le comportement
          'transport . vélo . km': 100,
          'alimentation . plats . viande 1 . nombre': 10,
        },
      );

      expect(updatedEngine.getSituation()).toEqual({
        'transport . deux roues . type': "'scooter thermique'",
        'alimentation . plats . viande blanche . nombre': 10,
      });
    });

    // Skip this test as now unknown rules/values in the situation are simply
    // ignored instead of throwing an errors.
    test.skip('situation avec clé inconnue', () => {
      try {
        NGCCalculator.setSituationAvecMigration(engine.shallowCopy(), {
          // @ts-ignore : les clés sont volontairement incorrectes pour tester le comportement
          unknown: 10,
        });

        expect(false).toBeTruthy();
      } catch (e) {
        expect(e.message).toContain(`
[ Erreur lors de la mise à jour de la situation ]
➡️  Dans la règle "unknown"
✖️  'unknown' n'existe pas dans la base de règle.`);
      }
    });
  });
});
