import {
  CategorieRecherche,
  CategorieRechercheManager,
} from '../../../../src/domain/bibliotheque_services/categorieRecherche';

describe('CategorieRechercheManager', () => {
  it(`isDefault : renvoie le bonne valeur true`, () => {
    // GIVEN

    // WHEN
    const result = CategorieRechercheManager.isDefault(
      CategorieRecherche.nourriture,
    );

    // THEN
    expect(result).toEqual(true);
  });
  it(`isDefault : renvoie le bonne valeur false`, () => {
    // GIVEN

    // WHEN
    const result = CategorieRechercheManager.isDefault(
      CategorieRecherche.marche_local,
    );

    // THEN
    expect(result).toEqual(false);
  });
  it(`isDefault : renvoie le bonne valeur pour le mois`, () => {
    // GIVEN
    const MOIS_ANNEE = [
      CategorieRecherche.janvier,
      CategorieRecherche.fevrier,
      CategorieRecherche.mars,
      CategorieRecherche.avril,
      CategorieRecherche.mai,
      CategorieRecherche.juin,
      CategorieRecherche.juillet,
      CategorieRecherche.aout,
      CategorieRecherche.septembre,
      CategorieRecherche.octobre,
      CategorieRecherche.novembre,
      CategorieRecherche.decembre,
    ];

    const mois_courant = MOIS_ANNEE[new Date().getMonth()];
    const mois_suivant = MOIS_ANNEE[(new Date().getMonth() + 1) % 12];

    // THEN
    expect(CategorieRechercheManager.isDefault(mois_courant)).toEqual(true);
    expect(CategorieRechercheManager.isDefault(mois_suivant)).toEqual(false);
  });
});
