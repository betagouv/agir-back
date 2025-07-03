import { Injectable } from '@nestjs/common';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import {
  EtapeRecette,
  IngredientRecette,
  ResultatRecherche,
} from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import _ingredients_recette from './data/dump-ingredient_recipe.2024-08-09.17-29-40.json';
import _ingredients from './data/dump-ingredients.2024-08-09.17-44-22.json';
import _units from './data/dump-measurement_units.2024-09-06.json';
import _etapes from './data/dump-recipe_steps.2024-08-09.17-47-05.json';
import _recettes from './data/dump-recipes.2024-09-06.json';

// const API_URL = 'https://';

export type Recette_RAW = {
  id: number; // 11386,
  name: string; //'Pizza jambon et champignons, salade';
  slug: string; //string; //'pizza-jambon-et-champignons-salade';
  preparation_time: number; // 10;
  baking_time: number; // 30;
  rest_time: number; // 0;
  benefits: string; //'[{"type":"paragraph","children":[{"text":""}]}]';
  unbreakable: number; // 2;
  regime: number; // 4;
  recipe_category: string; //'PLC';
  months: string; // '[]';
  ingredient_months: string; // '[1,2,3,4,5,6,7,8,9,10,11,12]';
  ingredient_months_with_frozen: string; // '[1,2,3,4,5,6,7,8,9,10,11,12]';
  ingredient_food_practice: string; // '["contains_meat"]';
  express: number; // 0;
  express_15: number; // 1;
  nutriscore: string; //'B';
  ranking: string; //'PLC_HVOP/LEG/FEC-NON-COMPL';
  net_weight: number; // 1161.5;
  gross_weight: number; // 1320.5;
  kcal: number; // 1946.65;
  kj: number; // 8158.45;
  lipids: number; // 100.55;
  saturated_fatty_acids: number; // 30.13;
  carbohydrates: number; // 175.3;
  simple_sugars: number; // 22.05;
  fibres: number; // 19.83;
  proteins: number; // 78.79;
  salt: number; // 12.11;
  oils: number; // 40;
  water: number; //  770.66;
  pnns_animal_fat: number; // 0;
  pnns_carbohydrate: number; // 280;
  pnns_cheese: number; // 100;
  pnns_complete_carbohydrate: number; // 0;
  pnns_dairy_product: number; // 100;
  pnns_delicatessen: number; // 90;
  pnns_dried_vegetable: number; // 0;
  pnns_drink: number; // 0;
  pnns_egg: number; // 0;
  pnns_fatty_fish: number; // 0;
  pnns_fruit: number; // 0;
  pnns_fruit_and_vegetable: number; // 631;
  pnns_meat: number; // 0;
  pnns_milk: number; // 0;
  pnns_non_complete_carbohydrate: number; // 280;
  pnns_non_fatty_fish: number; // 0;
  pnns_non_poultry_meat: number; // 0;
  pnns_nuts: number; // 0;
  pnns_other: number; // 19;
  pnns_poultry: number; // 0;
  pnns_salt: number; // 1.5;
  pnns_sugar_product: number; // 0;
  pnns_vegetable: number; // 631;
  pnns_vegetable_fat: number; // 40;
  pnns_yoghurt: number; // 0;
};

export type Units_RAW = {
  id: number;
  name: string;
  plural: string;
  use_ingredient_name: number;
  computable: number;
  round_type: string; //"round_1"
};

export type Etapes_RAW = {
  id: number;
  text: string; //"[{\"children\":[{\"text\":\"Dans une casserole, mettre la crème fraîche et ajouter les lentilles cuites.\"}]}]",
  recipe_id: number;
};
export type IngredientRecette_RAW = {
  id: number;
  order: number;
  quantity: number;
  gross_weight: number;
  net_weight: number;
  measurement_unit_id: number;
  ingredient_id: number;
  recipe_id: number;
};

export type Ingredient_RAW = {
  id: number;
  legacy_id: number;
  name: string;
  plural: string;
  display_name: string;
  display_plural: string;
  months: string; //'{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true,"8":true,"9":true,"10":true,"11":true,"12":true}'
  food_practice: string; //'[]'
  is_oil: number; //0
  frozen_or_canned: number; //0
  exclude_from_distance: number; //0
  pnns_category: string; //'animal_fat'
  ingredient_family_id: number; //4
  nutritional_value_id: number; //634
  forbidden_out_of_season: number; //0
};

@Injectable()
export class RecettesRepository implements FinderInterface {
  constructor() {}

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    switch (cat) {
      case CategorieRecherche.vege:
        return 217;
      case CategorieRecherche.vegan:
        return 275;
      case CategorieRecherche.dinde_volaille:
        return 88;
      case CategorieRecherche.saison:
        return 811;
      case CategorieRecherche.poisson:
        return 196;

      default:
        return 0;
    }
  }
  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.vegan,
      CategorieRecherche.vege,
      CategorieRecherche.dinde_volaille,
      CategorieRecherche.saison,
      CategorieRecherche.poisson,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    let recherche: Recette_RAW[] = _recettes;

    const current_month = new Date().getMonth() + 1;

    if (filtre.categorie === CategorieRecherche.saison) {
      recherche = recherche.filter((a) => {
        const month_array = JSON.parse(a.ingredient_months) as number[];
        return month_array.includes(current_month);
      });
    }

    if (filtre.categorie === CategorieRecherche.dinde_volaille) {
      recherche = recherche.filter((a) => a.ranking.includes('VOL'));
    }

    if (filtre.categorie === CategorieRecherche.vegan) {
      recherche = recherche.filter(
        (a) =>
          a.regime === 1 && a.pnns_cheese === 0 && a.pnns_dairy_product === 0,
      );
    }

    if (filtre.categorie === CategorieRecherche.vege) {
      recherche = recherche.filter((a) => a.regime === 2);
    }

    if (filtre.categorie === CategorieRecherche.poisson) {
      recherche = recherche.filter((a) => this.contientDuPoisson(a));
    }

    const max_result = filtre.nombre_max_resultats || 10;

    recherche = recherche.slice(0, max_result);

    const mapped_result = recherche.map(
      (r) =>
        new ResultatRecherche({
          id: '' + r.id,
          titre: r.name,
          difficulty_plat: r.express === 1 ? 'Facile' : 'Intermédiaire',
          type_plat: this.mapCategoryPlat(r.recipe_category),
          temps_prepa_min: r.preparation_time,
          image_url: this.getImageUrlFromRecetteSlug(r.slug),
          fallback_image_url: this.getImageUrlFromCategorieRecette(
            r.recipe_category,
          ),
          ingredients: this.getIngredientsRecette(r.id),
          etapes_recette: this.getEtapesRecette(r.id),
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private getImageUrlFromCategorieRecette(recipe_category: string): string {
    if (!recipe_category)
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/plat_41956db95a.svg';
    if (recipe_category.includes('ENT'))
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/entree_62c9c6f503.svg';
    if (recipe_category.includes('DES'))
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/dessert_6e8fdb8ff0.svg';
    if (recipe_category.includes('PL'))
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/plat_41956db95a.svg';
    if (recipe_category.includes('GAR'))
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/plat_41956db95a.svg';
    if (recipe_category.includes('PLC'))
      return 'https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/plat_41956db95a.svg';
    return '-';
  }

  private getImageUrlFromRecetteSlug(slug: string): string {
    return `https://res.cloudinary.com/dq023imd8/image/upload/v1726729974/services/recettes/${slug}.webp`;
  }

  private getIngredientsRecette(recetteId: number): IngredientRecette[] {
    const liste_raw_ingredients = this.readIngredientsRecette(recetteId);

    const result = liste_raw_ingredients.map(
      (e) =>
        new IngredientRecette({
          nom: this.readIngredientsById(e.ingredient_id).name,
          ordre: e.order,
          poids: e.gross_weight,
          poids_net: e.net_weight,
          quantite: e.quantity,
          unite: this.computeUnit(e.quantity, e.measurement_unit_id),
        }),
    );
    return result;
  }

  private contientDuPoisson(recette: Recette_RAW): boolean {
    return recette.ingredient_food_practice.includes('contains_fish');
  }
  private computeUnit(quantity: number, unit_id: number): string {
    const unit = this.getUnitFromId(unit_id);
    if (!unit) {
      return '';
    }
    if (unit.use_ingredient_name === 1) {
      return '';
    }
    if (quantity > 1) {
      return unit.plural;
    } else {
      return unit.name;
    }
  }

  private getUnitFromId(id: number): Units_RAW {
    return _units.find((u) => u.id === id);
  }
  private getEtapesRecette(recetteId: number): EtapeRecette[] {
    const liste_raw_etapes = _etapes.filter((e) => e.recipe_id === recetteId);
    liste_raw_etapes.sort((a, b) => a.id - b.id);

    const result = [];
    let ordre = 0;
    for (const etape of liste_raw_etapes) {
      ordre++;
      let texte_etape = '';
      try {
        texte_etape = JSON.parse(etape.text)[0].children[0].text;
      } catch (error) {
        console.error(error);
        console.error(etape.text);
      }
      result.push(
        new EtapeRecette({
          ordre: ordre,
          texte: texte_etape,
        }),
      );
    }
    return result;
  }

  private readIngredientsRecette(recetteId: number): IngredientRecette_RAW[] {
    const result = _ingredients_recette.filter(
      (i) => i.recipe_id === recetteId,
    );
    result.sort((a, b) => a.order - b.order);
    return result;
  }
  private readIngredientsById(ingredientId: number): Ingredient_RAW {
    return _ingredients.find((e) => e.id === ingredientId);
  }

  private mapCategoryPlat(cat: string): string {
    if (!cat) return '-';
    if (cat.includes('ENT')) return 'Entrée';
    if (cat.includes('DES')) return 'Déssert';
    if (cat.includes('PL')) return 'Plat';
    if (cat.includes('GAR')) return 'Garniture';
    if (cat.includes('PLC')) return 'Plat complet';
    return '-';
  }
}
