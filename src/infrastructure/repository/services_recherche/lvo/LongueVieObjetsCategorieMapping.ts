import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { ActionLVAO } from '../../../../domain/lvao/action_LVAO';
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

  public static readonly mappings_interne: {
    categorie: CategorieRecherche;
    mapped_categorie: ActionLVAO;
  }[] = [
    {
      categorie: CategorieRecherche.vos_objets,
      mapped_categorie: null,
    },
    {
      categorie: CategorieRecherche.donner,
      mapped_categorie: ActionLVAO.donner,
    },
    {
      categorie: CategorieRecherche.reparer,
      mapped_categorie: ActionLVAO.reparer,
    },
    {
      categorie: CategorieRecherche.vendre,
      mapped_categorie: ActionLVAO.revendre,
    },
    {
      categorie: CategorieRecherche.louer,
      mapped_categorie: ActionLVAO.louer,
    },
    {
      categorie: CategorieRecherche.acheter,
      mapped_categorie: ActionLVAO.acheter,
    },
    {
      categorie: CategorieRecherche.emprunter,
      mapped_categorie: ActionLVAO.emprunter,
    },
  ];

  public static ACTION_CAT_RECHERCHE_MAPPING: {
    [key in ActionLVAO]?: CategorieRecherche;
  } = {
    donner: CategorieRecherche.donner,
    reparer: CategorieRecherche.reparer,
    revendre: CategorieRecherche.vendre,
    louer: CategorieRecherche.louer,
    acheter: CategorieRecherche.acheter,
    emprunter: CategorieRecherche.emprunter,
  };

  public static getFiltreFromCategorie(
    categorie: CategorieRecherche,
    interne: boolean,
  ): string {
    if (!categorie) {
      return null;
    }
    let content;
    if (interne) {
      content = LongueVieObjetsCategorieMapping.mappings_interne.find(
        (m) => m.categorie === categorie,
      );
    } else {
      content = LongueVieObjetsCategorieMapping.mappings.find(
        (m) => m.categorie === categorie,
      );
    }
    if (!content) return null;
    return content.mapped_categorie + '';
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
  public static getCategorieFromActionLVAO(
    action: ActionLVAO,
  ): CategorieRecherche {
    return this.ACTION_CAT_RECHERCHE_MAPPING[action];
  }
}
