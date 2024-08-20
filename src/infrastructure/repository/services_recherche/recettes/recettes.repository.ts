import { Injectable } from '@nestjs/common';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/resultatRecherche';
import _recettes from './data/dump-recipes.2024-08-09.17-38-20.json';

const API_URL = 'https://';

export type Recette = {
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

export type RecettesResponse = {
  id: string;
  titre: string;
  type: string;
  difficulty: string;
  temps_prepa_min: number;
  vege: boolean;
  vegan: boolean;
  volaille: boolean;
  saison: boolean;
  image_url: string;
}[];

const IMAGES_TMP = [
  'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Ftian-de-sardines.jpg&w=3840&q=75',
  'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fshutterstock_1938638506-dinde-provencale.jpg&w=3840&q=75',
  'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fshutterstock_1169506885-salade-crevettes-curry.jpg&w=3840&q=75',
  'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fquiche-chou-saumon-et-salade.jpg&w=3840&q=75',
  'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Ftiramisu-aux-fruits-rouges.jpg&w=3840&q=75',
];
@Injectable()
export class RecettesRepository implements FinderInterface {
  constructor() {}

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.vegan,
      CategorieRecherche.vege,
      CategorieRecherche.dinde_volaille,
      CategorieRecherche.saison,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    let recherche: Recette[] = _recettes;

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
      recherche = recherche.filter((a) => a.ingredient_food_practice === '[]');
    }

    if (filtre.categorie === CategorieRecherche.vege) {
      recherche = recherche.filter(
        (a) =>
          !a.ingredient_food_practice.includes('meat') &&
          !a.ingredient_food_practice.includes('fish') &&
          !a.ingredient_food_practice.includes('pork'),
      );
    }

    recherche = recherche.slice(0, 10);

    const mapped_result = recherche.map(
      (r) =>
        new ResultatRecherche({
          id: '' + r.id,
          titre: r.name,
          difficulty_plat: r.express === 1 ? 'Facile' : 'Intérmédiaire',
          type_plat: r.ranking,
          temps_prepa_min: r.preparation_time,
          image_url: IMAGES_TMP[Math.floor(Math.random() * 5)],
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
  ): Promise<RecettesResponse> {
    const result: RecettesResponse = [
      {
        id: '1',
        titre: 'Tian de sardines',
        difficulty: 'Intérmédiaire',
        saison: true,
        temps_prepa_min: 30,
        type: 'Plat principal',
        vegan: false,
        vege: false,
        volaille: false,
        image_url:
          'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Ftian-de-sardines.jpg&w=3840&q=75',
      },
      {
        id: '2',
        titre: 'Dinde à la provençale',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 40,
        type: 'Plat principal',
        vegan: false,
        vege: false,
        volaille: true,
        image_url:
          'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fshutterstock_1938638506-dinde-provencale.jpg&w=3840&q=75',
      },
      {
        id: '3',
        titre: 'Salade crevettes au curry',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 20,
        type: 'Entrée',
        vegan: false,
        vege: false,
        volaille: false,
        image_url:
          'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fshutterstock_1169506885-salade-crevettes-curry.jpg&w=3840&q=75',
      },
      {
        id: '4',
        titre: 'Quiche saumon',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 25,
        type: 'Entrée',
        vegan: false,
        vege: false,
        volaille: false,
        image_url:
          'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Fquiche-chou-saumon-et-salade.jpg&w=3840&q=75',
      },
      {
        id: '5',
        titre: 'Tiramissu',
        difficulty: 'Facile',
        saison: true,
        temps_prepa_min: 20,
        type: 'Déssert',
        vegan: false,
        vege: true,
        volaille: false,
        image_url:
          'https://www.mangerbouger.fr/manger-mieux/la-fabrique-a-menus/_next/image?url=https%3A%2F%2Fapi-prod-fam.mangerbouger.fr%2Fstorage%2Frecettes%2Ftiramisu-aux-fruits-rouges.jpg&w=3840&q=75',
      },
    ];
    switch (filtre.categorie) {
      case CategorieRecherche.vegan:
        return [];
      case CategorieRecherche.vege:
        return result.filter((a) => a.vege);
      case CategorieRecherche.dinde_volaille:
        return result.filter((a) => a.volaille);
      case CategorieRecherche.saison:
        return result;
      default:
        return result;
    }
  }
}
