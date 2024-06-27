import { FiltreRecherche } from '../../../../src/domain/bibliotheque_services/filtreRecherche';

describe('FiltreRecherche', () => {
  it(`computeBox : calcul la boite autour d'un point central  `, () => {
    // GIVEN
    const filtre = new FiltreRecherche({
      point: { latitude: 48.716454, longitude: 2.232499 },
    });

    // WHEN
    filtre.computeBox(1000);

    // THEN
    expect(filtre.rect_A.latitude).toEqual(48.70741030189076);
    expect(filtre.rect_A.longitude).toEqual(2.2187918067397363);
    expect(filtre.rect_B.latitude).toEqual(48.72549769810924);
    expect(filtre.rect_B.longitude).toEqual(2.2462061932602633);
  });
});
