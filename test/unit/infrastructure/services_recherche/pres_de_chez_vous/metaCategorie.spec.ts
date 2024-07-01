import { CategorieRecherche } from '../../../../../src/domain/bibliotheque_services/categorieRecherche';
import { PresDeChezNousCategorieMapping } from '../../../../../src/infrastructure/repository/services_recherche/presDeChezNousMetaCategorie';

describe('Prez de chez vous - MetaCategorie', () => {
  it('getFiltreFromCategorie : categorie iconnue', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      'qfsq' as any,
    );
    //THEN
    expect(val).toEqual('');
  });
  it('getFiltreFromCategorie : categorie vide', () => {
    //WHEN
    const val =
      PresDeChezNousCategorieMapping.getFiltreFromCategorie(undefined);
    //THEN
    expect(val).toEqual('');
  });
  it('getFiltreFromCategorie : categorie simple', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      CategorieRecherche.circuit_court,
    );
    //THEN
    expect(val).toEqual('537');
  });
  it('getFiltreFromCategorie : categorie multiple', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      CategorieRecherche.zero_dechet,
    );
    //THEN
    expect(val).toEqual('863,828,856,864,829,857,865,830,858');
  });
});
