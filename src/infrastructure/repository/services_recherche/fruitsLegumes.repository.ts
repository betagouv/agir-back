import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/finderInterface';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/resultatRecherche';

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

@Injectable()
export class FruitsLegumesRepository implements FinderInterface {
  constructor() {}

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

    const mapped_result = result.data.map(
      (r) =>
        new ResultatRecherche({
          id: r.slug,
          longitude: undefined,
          latitude: undefined,
          site_web: undefined,
          titre: r.name,
          adresse_rue: undefined,
          adresse_code_postal: undefined,
          adresse_nom_ville: undefined,
          impact_carbone_kg: r.ecv,
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
  ): Promise<FruitsLegumesResponse> {
    let response;
    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getFruitsLegumesAPIKEY()}`,
        },
        params: {
          month: this.getManagedCategories().indexOf(filtre.categorie) + 1,
        },
      });
    } catch (error) {
      if (error.response) {
        // haha
      } else if (error.request) {
        // hihi
      }
      return null;
    }
    return response.data;
  }
}
