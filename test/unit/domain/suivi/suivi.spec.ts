import { SuiviTransport } from '../../../../src/domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../../../src/domain/suivi/suiviAlimentation';
import { SuiviType } from '../../../../src/domain/suivi/suiviType';

describe('Objet Suivi', () => {
  it('constructor : should build with optionnal ata object', () => {
    // GIVEN
    let data = {
      viande_rouge: 5,
      viande_blanche: 10,
    };
    // WHEN
    let suivi = new SuiviAlimentation(null, data);
    // THEN
    expect(suivi.getDate).toBeDefined();
    expect(suivi.viande_rouge).toEqual(5);
    expect(suivi.viande_blanche).toEqual(10);
    expect(suivi.poisson_blanc).toEqual(0);
  });
  it('mergeSuiviDataWith : merge suivi data keep this date', () => {
    // GIVEN
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    // WHEN
    let result = suivi1.mergeSuiviDataWith(suivi2);
    // THEN
    expect(result.getDate()).toEqual(new Date(1));
  });
  it('mergeSuiviDataWith : merge suivi data set type to merge', () => {
    // GIVEN
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    // WHEN
    let result = suivi1.mergeSuiviDataWith(suivi2);
    // THEN
    expect(result.getType()).toEqual(SuiviType.merge);
  });
  it('mergeSuiviDataWith : adds suivi data set type to merge', () => {
    // GIVEN
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    // WHEN
    let result = suivi1.mergeSuiviDataWith(suivi2);
    // THEN
    expect(result.getType()).toEqual(SuiviType.merge);
  });
  it('mergeSuiviDataWith : sums total impact', () => {
    // GIVEN
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    suivi1.total_impact = 10;
    suivi2.total_impact = 20;
    // WHEN
    let result = suivi1.mergeSuiviDataWith(suivi2);
    // THEN
    expect(result.getTotalImpact()).toEqual(30);
  });
  it('mergeSuiviDataWith : merge keys', () => {
    // GIVEN
    let suivi1 = new SuiviTransport(new Date(1));
    let suivi2 = new SuiviAlimentation(new Date(2));
    suivi1.km_scooter = 34;
    suivi2.viande_blanche = 10;
    // WHEN
    let result = suivi1.mergeSuiviDataWith(suivi2);
    // THEN
    expect(result['km_scooter']).toEqual(34);
    expect(result['viande_blanche']).toEqual(10);
  });
});
