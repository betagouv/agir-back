import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../../applicationError';

const API_URL =
  'https://quefairedemesobjets-preprod.osc-fr1.scalingo.io/api/qfdmo/acteurs';

export type LVOResponse = {
  items: [
    {
      identifiant_unique: string;
    },
  ];
};

@Injectable()
export class LongueVieObjetsRepository implements FinderInterface {
  static API_TIMEOUT = 4000;

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.vos_objets,
      CategorieRecherche.donner,
      CategorieRecherche.jeter,
      CategorieRecherche.reparer,
      CategorieRecherche.vendre,
      CategorieRecherche.louer,
      CategorieRecherche.acheter,
      CategorieRecherche.emprunter,
    ];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    const result = await this.callServiceAPI(filtre, filtre.categorie);

    if (!result) {
      ApplicationError.throwExternalServiceError('Longue vie objets');
    }
    const final_result: ResultatRecherche[] = result.items.map(
      (r) =>
        new ResultatRecherche({
          id: r.identifiant_unique,
          titre: 'yo',
        }),
    );

    return final_result;
  }

  private async callServiceAPI(
    filtre: FiltreRecherche,
    categorie: string,
  ): Promise<LVOResponse> {
    let response;
    const call_time = Date.now();
    try {
      response = await axios.get(API_URL, {
        timeout: LongueVieObjetsRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          rayon: 2,
          offset: 0,
          latitude: 48.4,
          longitude: 2.8,
          limit: filtre.nombre_max_resultats ? filtre.nombre_max_resultats : 10,
        },
      });
    } catch (error) {
      console.log(`Error calling [lvo] after ${Date.now() - call_time} ms`);
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:lvo:${Date.now() - call_time}`);
    return response.data;
  }
}
