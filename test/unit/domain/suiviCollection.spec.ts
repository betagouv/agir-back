import { SuiviCollection } from '../../../src/domain/suivi/suiviCollection';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';

describe('Objet SuiviCollection', () => {
  it('should merge ok all data', () => {
    let a1 = new SuiviAlimentation();
    let a2 = new SuiviAlimentation();
    let a3 = new SuiviAlimentation();
    let t1 = new SuiviTransport();
    let t2 = new SuiviTransport();
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2, a3];
    suiviCollection.transports = [t1, t2];
    expect(suiviCollection.mergeAll()).toHaveLength(5);
  });
  it('should order ok all suivi', () => {
    let a1 = new SuiviAlimentation(new Date(1));
    let a2 = new SuiviAlimentation(new Date(4));
    let a3 = new SuiviAlimentation(new Date(3));
    let t1 = new SuiviTransport(new Date(2));
    let t2 = new SuiviTransport(new Date(5));
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2, a3];
    suiviCollection.transports = [t1, t2];
    const result = suiviCollection.mergeAllAndOrderByDate();
    expect(result).toHaveLength(5);
    expect(result[0].getDate().getTime()).toEqual(1);
    expect(result[1].getDate().getTime()).toEqual(2);
    expect(result[2].getDate().getTime()).toEqual(3);
    expect(result[3].getDate().getTime()).toEqual(4);
    expect(result[4].getDate().getTime()).toEqual(5);
  });
  it('should return ok last suivi', () => {
    let a1 = new SuiviAlimentation(new Date(1));
    let a2 = new SuiviAlimentation(new Date(4));
    let t1 = new SuiviTransport(new Date(5));
    let suiviCollection = new SuiviCollection();
    suiviCollection.alimentation = [a1, a2];
    suiviCollection.transports = [t1];
    expect(suiviCollection.getLastSuiviDate().getTime()).toEqual(5);
  });
  it('should return undefined date when no suivi', () => {
    let suiviCollection = new SuiviCollection();
    expect(suiviCollection.getLastSuiviDate()).toStrictEqual(undefined);
  });
});
