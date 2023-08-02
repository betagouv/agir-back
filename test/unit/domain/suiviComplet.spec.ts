import { SuiviComplet } from '../../../src/domain/suivi/suiviComplet';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';

describe('Objet SuiviComplet', () => {
  it('isEmpty : should say empty when empty', () => {
    let suiviComplet = new SuiviComplet();
    expect(suiviComplet.isEmpty()).toStrictEqual(true);
  });
  it('isOfSameDay : should say true when same day', () => {
    let suiviComplet = new SuiviComplet();

    // GIVEN
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let a2 = new SuiviTransport(new Date(Date.parse('2023-01-01')));
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);

    // THEN
    expect(suiviComplet.isOfSameDay(a2)).toStrictEqual(true);
  });
  it('isOfSameDay : should say false when not same day', () => {
    let suiviComplet = new SuiviComplet();

    // GIVEN
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let a2 = new SuiviTransport(new Date(Date.parse('2023-01-12')));
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);

    // THEN
    expect(suiviComplet.isOfSameDay(a2)).toStrictEqual(false);
  });
  it('should say not empty when not empty', () => {
    let suiviComplet = new SuiviComplet();
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(
      new SuiviAlimentation(),
    );
    expect(suiviComplet.isEmpty()).toStrictEqual(false);
  });
  it('getNombreSuivi : should say 1 when 1 suivi', () => {
    let suiviComplet = new SuiviComplet();
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(
      new SuiviAlimentation(),
    );
    expect(suiviComplet.getNombreSuivi()).toEqual(1);
  });
  it('addSuiviOfTypeIfNotAlreadyThere : should not add second suivi of same type', () => {
    // GIVEN
    let suiviComplet = new SuiviComplet();
    let a1 = new SuiviAlimentation();
    let a2 = new SuiviAlimentation();
    a1.vegetarien = 1;
    a2.vegetarien = 2;

    // WHEN
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a2);

    // THEN
    expect(suiviComplet.getNombreSuivi()).toEqual(1);
    expect(suiviComplet.mergeAllToSingleSuivi()['vegetarien']).toEqual(1);
  });
  it('addSuiviOfTypeIfNotAlreadyThere : should not add second suivi of different date', () => {
    // GIVEN
    let suiviComplet = new SuiviComplet();
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let t1 = new SuiviTransport(new Date(Date.parse('2023-01-15')));

    // WHEN
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(t1);

    // THEN
    expect(suiviComplet.getNombreSuivi()).toEqual(1);
  });
  it('mergeAllToSingleSuivi : merge all data', () => {
    // GIVEN
    let suiviComplet = new SuiviComplet();
    let a1 = new SuiviAlimentation();
    let t1 = new SuiviTransport();
    a1.vegetarien = 1;
    t1.km_voiture = 200;

    // WHEN
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(t1);

    // THEN
    expect(suiviComplet.getNombreSuivi()).toEqual(2);
    expect(suiviComplet.mergeAllToSingleSuivi()['vegetarien']).toEqual(1);
    expect(suiviComplet.mergeAllToSingleSuivi()['km_voiture']).toEqual(200);
  });
  it('computeLastVariationOfList : ', () => {
    // GIVEN
    let suiviComplet1 = new SuiviComplet();
    let suiviComplet2 = new SuiviComplet();
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let a2 = new SuiviAlimentation(new Date(Date.parse('2023-01-15')));
    a1.total_impact = 10;
    a2.total_impact = 30;
    suiviComplet1.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet2.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a2);

    // WHEN
    let result = SuiviComplet.computeLastVariationOfList([
      suiviComplet1,
      suiviComplet2,
    ]);

    // THEN
    expect(result).toEqual(20);
  });
  it('computeMoyenne : ', () => {
    // GIVEN
    let suiviComplet1 = new SuiviComplet();
    let suiviComplet2 = new SuiviComplet();
    let a1 = new SuiviAlimentation(new Date(Date.parse('2023-01-01')));
    let a2 = new SuiviAlimentation(new Date(Date.parse('2023-01-15')));
    a1.total_impact = 10;
    a2.total_impact = 20;
    suiviComplet1.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet2.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a2);

    // WHEN
    let result = SuiviComplet.computeMoyenne([suiviComplet1, suiviComplet2]);

    // THEN
    expect(result).toEqual(15);
  });
  it('computeMoyenne : ', () => {
    // GIVEN
    let suiviComplet = new SuiviComplet();
    let a1 = new SuiviAlimentation();
    let t1 = new SuiviTransport();
    a1.total_impact = 10;
    t1.total_impact = 20;
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(a1);
    suiviComplet.addSuiviOfTypeIfNotAlreadyThereAndSameDay(t1);

    // WHEN
    let result = suiviComplet.computeTotalImpact();

    // THEN
    expect(result).toEqual(30);
  });
});
