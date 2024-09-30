import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { CategorieRecherche } from '../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../domain/bibliotheque_services/recherche/finderInterface';
import { ModeDeplacement } from '../../../domain/bibliotheque_services/types/modeDeplacement';
import { ResultatRecherche } from '../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { DistancesRepository } from './distances.repository';

const API_URL = 'https://impactco2.fr/api/v1/transport';

/*
1 : Avion
2 : TGV
3 : Intercités
4 : Voiture thermique
5 : Voiture électrique
6 : Autocar
7 : Vélo ou marche
8 : Vélo (ou trottinette) à assistance électrique
9 : Bus thermique
10 : Tramway
11 : Métro
12 : Scooter ou moto légère
13 : Moto
14 : RER ou Transilien
15 : TER
16 : Bus électrique
21 : Bus (GNV)
*/
class Mode {
  static class_voiture = '4,5,6,9,12,13,16,21';
  static class_velo_elec = '8';
  static class_velo_marche = '7';
  static class_rail = '2,3,10,11,14,15';
}

class ImageMap {
  static '1' = 'avion.svg';
  static '2' = 'tgv.svg';
  static '3' = 'intercites.svg';
  static '4' = 'voiturethermique.svg';
  static '5' = 'voitureelectrique.svg';
  static '6' = 'autocar.svg';
  static '7' = 'velo.svg';
  static '8' = 'veloelectrique.svg';
  static '9' = 'busthermique.svg';
  static '10' = 'tramway.svg';
  static '11' = 'metro.svg';
  static '12' = 'scooter.svg';
  static '13' = 'moto.svg';
  static '14' = 'rer.svg';
  static '15' = 'ter.svg';
  static '16' = 'buselectrique.svg';
  static '21' = 'busgnv.svg';
}

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
    let distance_velo;
    let distance_marche;
    let distance_auto;

    if (filtre.distance_metres) {
      distance_metres = filtre.distance_metres;
    } else {
      distance_auto = await this.computeDistanceMetres(
        ModeDeplacement.voiture,
        filtre,
      );
      distance_marche = await this.computeDistanceMetres(
        ModeDeplacement.pieds,
        filtre,
      );
      distance_velo = await this.computeDistanceMetres(
        ModeDeplacement.velo,
        filtre,
      );
    }

    let result: ResultatRecherche[];
    if (distance_metres) {
      const reponse = await this.callServiceAPI(distance_metres, null);
      result = this.mapReponseToResultatRecherche(reponse, distance_metres);
    } else {
      const reponse_auto = await this.callServiceAPI(
        distance_auto,
        Mode.class_voiture,
      );
      const reponse_velo = await this.callServiceAPI(
        distance_velo,
        Mode.class_velo_elec,
      );
      const reponse_marche = await this.callServiceAPI(
        distance_marche,
        Mode.class_velo_marche,
      );
      const reponse_rail = await this.callServiceAPI(
        distance_auto,
        Mode.class_rail,
      );
      result = [].concat(
        this.mapReponseToResultatRecherche(reponse_auto, distance_auto),
        this.mapReponseToResultatRecherche(reponse_velo, distance_velo),
        this.mapReponseToResultatRecherche(reponse_marche, distance_marche),
        this.mapReponseToResultatRecherche(reponse_rail, distance_auto),
      );
    }

    result.sort((a, b) => a.impact_carbone_kg - b.impact_carbone_kg);

    return result;
  }

  private mapReponseToResultatRecherche(
    reponse: ImpactResponse,
    distance_metres: number,
  ): ResultatRecherche[] {
    return reponse.data.map(
      (d) =>
        new ResultatRecherche({
          id: d.id.toString(),
          titre: d.name,
          impact_carbone_kg: d.value,
          distance_metres: distance_metres,
          image_url:
            App.getBaseURLFront() +
            '/impact_co2_img_transports/' +
            ImageMap[d.id.toString()],
        }),
    );
  }

  private async computeDistanceMetres(
    mode: ModeDeplacement,
    filtre: FiltreRecherche,
  ): Promise<number> {
    const result = await this.distancesRepository.find(
      new FiltreRecherche({
        rect_A: filtre.rect_A,
        rect_B: filtre.rect_B,
        mode_deplacement: mode,
      }),
    );
    return result[0].distance_metres;
  }

  private async callServiceAPI(
    distance_metres: number,
    transports: string,
  ): Promise<ImpactResponse> {
    let response;

    const params: any = {
      km: distance_metres / 1000,
      displayAll: 0,
      language: 'fr',
    };

    if (transports) {
      params.transports = transports;
    }

    try {
      response = await axios.get(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${App.getFruitsLegumesAPIKEY()}`,
        },
        params: params,
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
