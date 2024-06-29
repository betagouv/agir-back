import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { CategoriesPresDeChezNous } from './categoriesPresDeChezNous';

export class Mapping {
  categorie: CategorieRecherche;
  mapped_categories: CategoriesPresDeChezNous[];
}

export class PresDeChezNousCategorieMapping {
  public static readonly mappings: Mapping[] = [
    {
      categorie: CategorieRecherche.lieux_collaboratifs,
      mapped_categories: [CategoriesPresDeChezNous.Lieux_collaboratifs],
    },
    {
      categorie: CategorieRecherche.nourriture,
      mapped_categories: [
        CategoriesPresDeChezNous.Alimentation_et_Agriculture,
        CategoriesPresDeChezNous.Épicerie_Supérette,
      ],
    },
  ];

  public static getFiltreFromCategorie(categorie: CategorieRecherche): string {
    if (!categorie || categorie === CategorieRecherche.default) {
      return '';
    }
    const content = PresDeChezNousCategorieMapping.mappings.find(
      (m) => m.categorie === categorie,
    );
    if (!content) return '';
    return content.mapped_categories.join();
  }
}
