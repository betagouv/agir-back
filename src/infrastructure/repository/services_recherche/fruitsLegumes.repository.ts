import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/recherche/finderInterface';
import {
  FruitLegume,
  ResultatRecherche,
} from '../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../applicationError';
import fruits_legumes from './fruits_legumes.json';

const API_URL = 'https://impactco2.fr/api/v1/fruitsetlegumes';

export type FruitsLegumesResponse = {
  data: [
    {
      name: string;
      months: number[];
      ecv: number;
      slug: string;
    },
  ];
};

export type rawEntry = {
  label: Record<'fr', string>;
  months: number[];
  emoji: string;
  local: boolean;
  pef: number;
  CO2: number;
  suggestions?: boolean;
  type?: FruitLegume;
  img?: string;
};

@Injectable()
export class FruitsLegumesRepository implements FinderInterface {
  static API_TIMEOUT = 4000;
  private entriesByNameMap: Map<string, rawEntry>;

  constructor() {
    this.loadFruitsData(fruits_legumes as rawEntry[]);
  }
  private loadFruitsData(fruits: rawEntry[]) {
    this.entriesByNameMap = new Map();

    for (let month = 0; month < 12; month++) {
      fruits.forEach((entry) => {
        this.entriesByNameMap.set(entry.label.fr, entry);
      });
    }
  }

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [
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
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const result = await this.callServiceAPI(filtre);

    if (!result) {
      ApplicationError.throwExternalServiceError('Fruits et légumes de saison');
    }
    const mapped_result = result.data.map(
      (r) =>
        new ResultatRecherche({
          id: r.slug,
          titre: r.name,
          impact_carbone_kg: r.ecv,
          emoji: this.getEmoji(r.name),
          type_fruit_legume: this.getType(r.name),
          image_url:
            App.getBaseURLFront() +
            '/impact_co2_img_fruits_legumes/' +
            this.getImageFileName(r.name),
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
  ): Promise<FruitsLegumesResponse> {
    let response;
    let params;
    if (filtre.categorie) {
      params = {
        month: this.getManagedCategories().indexOf(filtre.categorie) + 1,
      };
    } else {
      params = {};
    }
    const call_time = Date.now();
    try {
      response = await axios.get(API_URL, {
        timeout: FruitsLegumesRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getFruitsLegumesAPIKEY()}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(
        `Error calling [impactco2.fr/api/v1/fruitsetlegumes] after ${
          Date.now() - call_time
        } ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(
      `API_TIME:impactco2.fr/api/v1/fruitsetlegumes:${Date.now() - call_time}`,
    );
    return response.data;
  }

  private getEmoji(nom: string): string {
    const entry = this.entriesByNameMap.get(nom);
    return entry ? entry.emoji : null;
  }

  private getType(nom: string): FruitLegume {
    const entry = this.entriesByNameMap.get(nom);
    return entry ? entry.type : null;
  }
  private getImageFileName(nom: string): string {
    const entry = this.entriesByNameMap.get(nom);
    return entry ? entry.img : null;
  }
}
