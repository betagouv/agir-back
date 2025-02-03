import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/recherche/filtreRecherche';

describe('FiltreRecherche', () => {
  it(`computeBox : calcul la boite autour d'un point central  `, () => {
    // GIVEN
    const filtre = new FiltreRecherche({
      point: { latitude: 48.716454, longitude: 2.232499 },
    });

    // WHEN
    filtre.computeBox?.(1000);

    // THEN
    expect(filtre.rect_A?.latitude).toEqual(48.70741030189076);
    expect(filtre.rect_A?.longitude).toEqual(2.2187918067397363);
    expect(filtre.rect_B?.latitude).toEqual(48.72549769810924);
    expect(filtre.rect_B?.longitude).toEqual(2.2462061932602633);
  });
  it(`getDistanceMetresFromSearchPoint : calcul la distance par rapport au point argument `, () => {
    // GIVEN
    const filtre = new FiltreRecherche({
      point: { latitude: 48.716454, longitude: 2.232499 },
    });

    // WHEN
    const result = filtre.getDistanceMetresFromSearchPoint?.(
      48.716454,
      2.232499,
    );

    // THEN
    expect(result).toEqual(0);
  });
  it(`getDistanceMetresFromSearchPoint : calcul la distance par rapport au point argument `, () => {
    // GIVEN
    const filtre = new FiltreRecherche({
      point: { latitude: 48.716454, longitude: 2.232499 },
    });

    // WHEN
    const result = filtre.getDistanceMetresFromSearchPoint?.(45, 2);

    // THEN
    expect(result).toEqual(413628);
  });
});
