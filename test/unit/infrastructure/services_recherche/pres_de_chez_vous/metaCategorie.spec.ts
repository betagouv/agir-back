import { CategorieRecherche } from '../../../../../src/domain/bibliotheque_services/categorieRecherche';
import { PresDeChezNousCategorieMapping } from '../../../../../src/infrastructure/repository/services_recherche/presDeChezNousMetaCategorie';

describe('Prez de chez vous - MetaCategorie', () => {
  it('getFiltreFromCategorie : categorie default', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      CategorieRecherche.default,
    );
    //THEN
    expect(val).toEqual('');
  });
  it('getFiltreFromCategorie : categorie simple', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      CategorieRecherche.lieux_collaboratifs,
    );
    //THEN
    expect(val).toEqual('794');
  });
  it('getFiltreFromCategorie : categorie multiple', () => {
    //WHEN
    const val = PresDeChezNousCategorieMapping.getFiltreFromCategorie(
      CategorieRecherche.nourriture,
    );
    //THEN
    expect(val).toEqual('532,534');
  });
});
