import { Suivi } from 'src/domain/suivi/suivi';
import { SuiviRepository } from 'src/infrastructure/repository/suivi.repository';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';

describe('Objet Suivi', () => {
  it('should return stored value', () => {
    let s = new SuiviAlimentation();
    s.viande_rouge = 2;
    expect(s.getAttributs()).toHaveLength(1);
    expect(s.getAttributs()[0]).toEqual('viande_rouge');
    expect(s.getValeursAsStrings()[0]).toEqual('2');
  });
  it('should populate key ok when number', () => {
    let keys = ['viande_rouge'];
    let values = ['2'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(2);
  });
  it('should populate key ok when boolean true', () => {
    let keys = ['viande_rouge'];
    let values = ['true'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(true);
  });
  it('should populate key ok when boolean false', () => {
    let keys = ['viande_rouge'];
    let values = ['false'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(false);
  });
  it('should populate leave undefined unpopulated key', () => {
    let keys = ['toto'];
    let values = ['false'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(undefined);
  });
});
