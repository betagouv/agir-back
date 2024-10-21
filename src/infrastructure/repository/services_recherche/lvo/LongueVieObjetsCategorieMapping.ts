import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { CategoriesLongueVieObjets } from './categoriesLongueVieObjets';

export class LongueVieObjetsCategorieMapping {
  public static readonly mappings: {
    categorie: CategorieRecherche;
    mapped_categorie: CategoriesLongueVieObjets;
  }[] = [
    {
      categorie: CategorieRecherche.vos_objets,
      mapped_categorie: null,
    },
    {
      categorie: CategorieRecherche.donner,
      mapped_categorie: CategoriesLongueVieObjets.donner,
    },
    {
      categorie: CategorieRecherche.reparer,
      mapped_categorie: CategoriesLongueVieObjets.reparer,
    },
    {
      categorie: CategorieRecherche.vendre,
      mapped_categorie: CategoriesLongueVieObjets.revendre,
    },
    {
      categorie: CategorieRecherche.louer,
      mapped_categorie: CategoriesLongueVieObjets.louer,
    },
    {
      categorie: CategorieRecherche.acheter,
      mapped_categorie: CategoriesLongueVieObjets.acheter,
    },
    {
      categorie: CategorieRecherche.emprunter,
      mapped_categorie: CategoriesLongueVieObjets.emprunter,
    },
  ];

  public static getFiltreFromCategorie(
    categorie: CategorieRecherche,
  ): CategoriesLongueVieObjets {
    if (!categorie) {
      return null;
    }
    const content = LongueVieObjetsCategorieMapping.mappings.find(
      (m) => m.categorie === categorie,
    );
    if (!content) return null;
    return content.mapped_categorie;
  }

  public static getCategorieFromAction(
    categorie: CategoriesLongueVieObjets,
  ): CategorieRecherche {
    if (!categorie) {
      return null;
    }
    const content = LongueVieObjetsCategorieMapping.mappings.find(
      (m) => m.mapped_categorie === categorie,
    );
    if (!content) return null;
    return content.categorie;
  }
}
