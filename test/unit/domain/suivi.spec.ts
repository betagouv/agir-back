import { Suivi } from '../../../src/domain/suivi/suivi';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';

describe('Objet Suivi', () => {
  it('should return stored value', () => {
    let s = new SuiviAlimentation();
    s.viande_rouge = 2;
    let index = s.getAttributs().indexOf('viande_rouge');
    expect(s.getValeursAsStrings()[index]).toEqual('2');
  });
  it('populateValues : should populate key ok when number', () => {
    let keys = ['viande_rouge'];
    let values = ['2'];
    let suivi = new SuiviAlimentation();
    suivi.populateValues(keys, values);
    expect(suivi.viande_rouge).toStrictEqual(2);
  });
  it('populateValues : should populate key ok when boolean false', () => {
    let keys = ['bus'];
    let values = ['false'];
    let suivi = new SuiviTransport();
    suivi.populateValues(keys, values);
    expect(suivi.bus).toStrictEqual(false);
  });
  it('populateValues : should populate key ok when boolean true', () => {
    let keys = ['bus'];
    let values = ['true'];
    let suivi = new SuiviTransport();
    suivi.populateValues(keys, values);
    expect(suivi.bus).toStrictEqual(true);
  });
  it('mergeSuiviDataWith : merge suivi data keep this date', () => {
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    let result = suivi1.mergeSuiviDataWith(suivi2);
    expect(result.getDate()).toEqual(new Date(1));
  });
  it('mergeSuiviDataWith : merge suivi data set type to merge', () => {
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    let result = suivi1.mergeSuiviDataWith(suivi2);
    expect(result.getType()).toEqual(Suivi.merge);
  });
  it('mergeSuiviDataWith : adds suivi data set type to merge', () => {
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    let result = suivi1.mergeSuiviDataWith(suivi2);
    expect(result.getType()).toEqual(Suivi.merge);
  });
  it('mergeSuiviDataWith : sums total impact', () => {
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    suivi1.total_impact = 10;
    suivi2.total_impact = 20;
    let result = suivi1.mergeSuiviDataWith(suivi2);
    expect(result.getTotalImpact()).toEqual(30);
  });
  it('mergeSuiviDataWith : merge keys', () => {
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    suivi1.km_scooter = 34;
    suivi2.viande_blanche = 10;
    let result = suivi1.mergeSuiviDataWith(suivi2);
    expect(result['km_scooter']).toEqual(34);
    expect(result['viande_blanche']).toEqual(10);
    expect(result.getAttributs()).toContain('km_scooter');
    expect(result.getAttributs()).toContain('viande_blanche');
  });
});
