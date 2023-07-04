import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';

describe('Objet Suivi', () => {
  it('should return stored value', () => {
    let s = new SuiviAlimentation();
    s.viande_rouge = 2;
    let index = s.getAttributs().indexOf('viande_rouge');
    expect(s.getValeursAsStrings()[index]).toEqual('2');
  });
  it('should populate key ok when number', () => {
    let keys = ['viande_rouge'];
    let values = ['2'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(2);
  });
  it('should populate key ok when boolean false', () => {
    let keys = ['bus'];
    let values = ['false'];
    let suivi = new SuiviTransport();
    suivi.populateValues(keys, values);
    expect(suivi.bus).toStrictEqual(false);
  });
  it('should populate key ok when boolean true', () => {
    let keys = ['bus'];
    let values = ['true'];
    let suivi = new SuiviTransport();
    suivi.populateValues(keys, values);
    expect(suivi.bus).toStrictEqual(true);
  });
});
