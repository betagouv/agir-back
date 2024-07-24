import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/finderInterface';
import { ModeDeplacement } from '../../../domain/bibliotheque_services/modeDeplacement';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/resultatRecherche';

const API_URL = 'https://api.openrouteservice.org/v2/matrix';

export type MatrixResponse = {
  distances: number[][];
};

enum Mode {
  driving_car = 'driving-car',
  cycling_regular = 'cycling-regular',
  foot_walking = 'foot-walking',
}

@Injectable()
export class DistancesRepository implements FinderInterface {
  public getManagedCategories(): CategorieRecherche[] {
    return [];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const mode = this.mapMode(filtre.mode_deplacement);

    const result = await this.callMatrixAPI(filtre, mode);

    return [
      new ResultatRecherche({
        id: null,
        distance_metres: Math.round(result.distances[0][0]),
        titre: 'Distance',
      }),
    ];
  }

  private mapMode(mode: ModeDeplacement): Mode {
    switch (mode) {
      case ModeDeplacement.pieds:
        return Mode.foot_walking;
      case ModeDeplacement.voiture:
        return Mode.driving_car;
      case ModeDeplacement.velo:
        return Mode.cycling_regular;
      default:
        return Mode.driving_car;
    }
  }

  private async callMatrixAPI(
    filtre: FiltreRecherche,
    mode: Mode,
  ): Promise<MatrixResponse> {
    const data = {
      locations: [
        [filtre.rect_A.longitude, filtre.rect_A.latitude],
        [filtre.rect_B.longitude, filtre.rect_B.latitude],
      ],
      destinations: [1],
      metrics: ['distance'],
      resolve_locations: 'false',
      units: 'm',
    };
    let response;
    try {
      response = await axios.post(API_URL.concat('/', mode), data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: App.getOpenRouteAPIKEY(),
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
