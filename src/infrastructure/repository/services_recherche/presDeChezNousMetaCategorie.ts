import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { CategoriesPresDeChezNous } from './categoriesPresDeChezNous';

export class Mapping {
  categorie: CategorieRecherche;
  mapped_categories: CategoriesPresDeChezNous[];
}

export class PresDeChezNousCategorieMapping {
  public static readonly mappings: Mapping[] = [
    {
      categorie: CategorieRecherche.nourriture,
      mapped_categories: [CategoriesPresDeChezNous.Alimentation_et_Agriculture],
    },
    {
      categorie: CategorieRecherche.marche_local,
      mapped_categories: [CategoriesPresDeChezNous.Marché],
    },
    {
      categorie: CategorieRecherche.epicerie_superette,
      mapped_categories: [CategoriesPresDeChezNous.Épicerie_Supérette],
    },
    {
      categorie: CategorieRecherche.circuit_court,
      mapped_categories: [CategoriesPresDeChezNous.Circuits_courts],
    },
    {
      categorie: CategorieRecherche.zero_dechet,
      mapped_categories: [
        CategoriesPresDeChezNous.Produits_en_vrac,
        CategoriesPresDeChezNous.Produits_en_vrac_,
        CategoriesPresDeChezNous.Produits_en_vrac__,
        CategoriesPresDeChezNous.Emballages_consignés,
        CategoriesPresDeChezNous.Emballages_consignés_,
        CategoriesPresDeChezNous.Emballages_consignés__,
        CategoriesPresDeChezNous.Contenants_personnels,
        CategoriesPresDeChezNous.Contenants_personnels_,
        CategoriesPresDeChezNous.Contenants_personnels__,
      ],
    },
  ];

  public static getFiltreFromCategorie(categorie: CategorieRecherche): string {
    if (!categorie) {
      return '';
    }
    const content = PresDeChezNousCategorieMapping.mappings.find(
      (m) => m.categorie === categorie,
    );
    if (!content) return '';
    return content.mapped_categories.join();
  }
}
