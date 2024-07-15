import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/finderInterface';
import { ModeDeplacement } from '../../../domain/bibliotheque_services/modeDeplacement';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/resultatRecherche';
import { DistancesRepository } from './distances.repository';

const API_URL = 'https://impactco2.fr/api/v1/transport';

export type ImpactResponse = {
  data: [
    {
      id: number;
      name: string;
      value: number;
    },
  ];
};

@Injectable()
export class ImpactTransportsRepository implements FinderInterface {
  constructor(private distancesRepository: DistancesRepository) {}

  public getManagedCategories(): CategorieRecherche[] {
    return [CategorieRecherche.any_transport];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    let distance_metres;

    if (filtre.distance_metres) {
      distance_metres = filtre.distance_metres;
    } else {
      distance_metres = (
        await this.distancesRepository.find(
          new FiltreRecherche({
            rect_A: filtre.rect_A,
            rect_B: filtre.rect_B,
            mode_deplacement: ModeDeplacement.voiture,
          }),
        )
      )[0].distance_metres;
    }
    const result = await this.callServiceAPI(distance_metres);

    const mapped_result = result.data.map(
      (r) =>
        new ResultatRecherche({
          id: r.id.toString(),
          titre: r.name,
          impact_carbone_kg: r.value,
        }),
    );

    mapped_result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return mapped_result;
  }

  private async callServiceAPI(
    distance_metres: number,
  ): Promise<ImpactResponse> {
    let response;
    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getFruitsLegumesAPIKEY()}`,
        },
        params: {
          km: distance_metres / 1000,
          displayAll: 0,
          language: 'fr',
        },
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response);
      } else if (error.request) {
        console.log(error.request);
      }
      return null;
    }
    return response.data;
  }
}
