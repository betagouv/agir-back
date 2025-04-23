import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../domain/app';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../../applicationError';

const API_URL_CATNAT =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/catnat';

export type CatnatResponseElement = {
  codNatCatnat: string; // '79PREF20170717'
  communes: [
    {
      _path: string; //'/api/v1/{ressource}/{id}';
      typecom: {
        typecom: string; //'COMD';
        libelle: string; //'Commune déléguée';
      };
      com: string; //'13055';
      libelle: string; // 'Marseille';
    },
  ];
  numRisqueJo: string; //'1';
  libRisqueJo: string; //'Inondations et coulées de boue';
  dateDeb: string; //'08/12/1982';
  dateFin: string; //'31/12/1982';
  datePubArrete: string; //'11/01/1983';
  datePubJo: string; //'13/01/1983';
};

@Injectable()
export class MaifRepository implements FinderInterface {
  constructor() {}

  static API_TIMEOUT = 4000;

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [CategorieRecherche.catnat];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    if (filtre.categorie === CategorieRecherche.catnat) {
      if (!filtre.code_commune) return [];
      return this.findCatnat(filtre);
    }
  }

  private async findCatnat(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const result = await this.searchCatnatByCodeCommune(filtre.code_commune);
    if (!result) {
      ApplicationError.throwExternalServiceError('Alentours / Catnat');
    }
    return result.map(
      (r) =>
        new ResultatRecherche({
          id: r.codNatCatnat,
          nbr_resultats_max_dispo: result.length,
          titre: r.libRisqueJo,
        }),
    );
  }

  private async searchCatnatByCodeCommune(
    code_commune: string,
  ): Promise<CatnatResponseElement[]> {
    if (!App.getMaifAPILogin()) {
      console.log('Missing MAIF Credentials');
      return [];
    }
    let response;
    const call_time = Date.now();
    const params = {
      codeInsee: code_commune,
    };

    const BASIC = Buffer.from(
      `${App.getMaifAPILogin()}:${App.getMaifAPIPassword()}`,
    ).toString('base64');
    try {
      response = await axios.get(API_URL_CATNAT, {
        timeout: MaifRepository.API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${BASIC}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(
        `Error calling [maif/catnat] after ${Date.now() - call_time} ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:maif/catnat:${Date.now() - call_time}`);

    return response.data;
  }
}
