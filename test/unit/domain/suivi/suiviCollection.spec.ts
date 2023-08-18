import { SuiviCollection } from '../../../../src/domain/suivi/suiviCollection';
import { SuiviAlimentation } from '../../../../src/domain/suivi/suiviAlimentation';
import { SuiviTransport } from '../../../../src/domain/suivi/suiviTransport';

describe('Objet SuiviCollection', () => {
  it('mergeAll : should merge ok all data', () => {
    // GIVEN
    let a1 = new SuiviAlimentation();
    let a2 = new SuiviAlimentation();
    let a3 = new SuiviAlimentation();
    let t1 = new SuiviTransport();
    let t2 = new SuiviTransport();
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2, a3];
    suiviCollection.transports = [t1, t2];
    // WHEN-THEN
    expect(suiviCollection.mergeAll()).toHaveLength(5);
  });
  it('mergeAllAndOrderByDate : should order ok all suivi', () => {
    // GIVEN
    let a1 = new SuiviAlimentation(new Date(1));
    let a2 = new SuiviAlimentation(new Date(4));
    let a3 = new SuiviAlimentation(new Date(3));
    let t1 = new SuiviTransport(new Date(2));
    let t2 = new SuiviTransport(new Date(5));
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2, a3];
    suiviCollection.transports = [t1, t2];
    // WHEN
    const result = suiviCollection.mergeAllAndOrderByDate();
    // THEN
    expect(result).toHaveLength(5);
    expect(result[0].getDate().getTime()).toEqual(1);
    expect(result[1].getDate().getTime()).toEqual(2);
    expect(result[2].getDate().getTime()).toEqual(3);
    expect(result[3].getDate().getTime()).toEqual(4);
    expect(result[4].getDate().getTime()).toEqual(5);
  });
  it('getLastSuiviDate : should return ok last suivi', () => {
    // GIVEN
    let a1 = new SuiviAlimentation(new Date(1));
    let a2 = new SuiviAlimentation(new Date(4));
    let t1 = new SuiviTransport(new Date(5));
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2];
    suiviCollection.transports = [t1];
    // WHEN-THEN
    expect(suiviCollection.getLastSuiviDate().getTime()).toEqual(5);
  });
  it('getLastSuiviDate : should return undefined date when no suivi', () => {
    // GIVEN
    let suiviCollection = new SuiviCollection();
    expect(suiviCollection.getLastSuiviDate()).toStrictEqual(undefined);
  });
  it('getOrderedSuiviCompletList : should return merged data of last date', () => {
    // GIVEN
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let a2 = new SuiviAlimentation(new Date(Date.parse('2023-01-02')));
    let t1 = new SuiviTransport(new Date(Date.parse('2023-01-02')));
    a1.viande_rouge = 1;
    a1.total_impact = 2;
    a2.viande_rouge = 2;
    a2.total_impact = 3;
    t1.km_voiture = 12;
    t1.total_impact = 4;
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2];
    suiviCollection.transports = [t1];

    // WHEN
    const result = suiviCollection.getOrderedSuiviCompletList();

    // THEN
    expect(result).toHaveLength(2);
    expect(result[1].mergeAllToSingleSuivi()['viande_rouge']).toEqual(2);
    expect(result[1].mergeAllToSingleSuivi()['km_voiture']).toEqual(12);
    expect(result[1].mergeAllToSingleSuivi()['total_impact']).toEqual(7); //3+4
  });
  it('getOrderedSuiviCompletList : return undefined when empty collection', () => {
    // GIVEN
    let suiviCollection = new SuiviCollection();

    // WHEN
    const result = suiviCollection.getOrderedSuiviCompletList();

    // THEN
    expect(result).toHaveLength(0);
  });
  it('getOrderedSuiviCompletList : return element of single suivi collection', () => {
    // GIVEN
    let suiviCollection = new SuiviCollection();
    let a1 = new SuiviAlimentation(new Date(1));
    a1.poisson_blanc = 12;
    suiviCollection.alimentation = [a1];

    // WHEN
    const result = suiviCollection.getOrderedSuiviCompletList();

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0].mergeAllToSingleSuivi()['poisson_blanc']).toEqual(12);
  });
});
