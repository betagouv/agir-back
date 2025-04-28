import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../domain/app';
import { ApplicationError } from '../../../applicationError';

const API_URL_CATNAT =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/catnat';

const API_URL_ZONES_SECHERESSE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/secheresses/scores/CODE_COMMUNE/zones';

const API_URL_SCORE_SECHERESSE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/secheresses/scores';

const API_URL_SCORE_SEISME =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/seismes/scores';

const API_URL_SCORE_INONDATION =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/inondations/scores';

const API_URL_SCORE_SUBMERSION =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/submersions/scores';

const API_URL_SCORE_TEMPETE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/tempetes/scores';

const API_URL_SCORE_ARGILE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/argiles/scores';

const API_URL_SCORE_RADON =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/radon/scores';

const API_TIMEOUT = 4000;

export enum NiveauRisqueNat {
  'Très fort' = 'Très fort',
  'Fort' = 'Fort',
  'Moyen' = 'Moyen',
  'Faible' = 'Faible',
  'Très faible' = 'Très faible',
  'A priori nul ou hors zonage' = 'A priori nul ou hors zonage',
}
export type NiveauRisqueNat_Value = 1 | 2 | 3 | 4 | 5;

export type SeismeScoreAPI = {
  codeCommune: string; //'91661';
  libelleCommune: string; //'VILLEBON-SUR-YVETTE';
  score: string; //'1';
  color: string; //'#f0f0f0';
  label: string; //'1 - TRES FAIBLE';
  zone: {
    type: string; //'Feature';
    geometry: {
      type: string; //'Polygon';
      coordinates: number[][][]; //[[[2.241253, 48.685649], [2.239489, 48.685153]]];
    };
    properties: {
      codeCommune: string; //'91661';
      libelleCommune: string; //'VILLEBON-SUR-YVETTE';
      score: string; //'1';
      color: string; //'#f0f0f0';
      label: string; //'1 - TRES FAIBLE';
    };
  };
};
export type SecheresseScoreResponseAPI = {
  actuel: {
    score: NiveauRisqueNat_Value; //5,
    color: string; //"#68389b",
    label: NiveauRisqueNat; //"Très fort",
    zone: {
      type: string; //"Feature",
      geometry: {
        type: string; //"Polygon",
        coordinates: number[][][]; // [[[1.997847,48.001551],[2.000246,48.002862]]]
      };
      properties: {
        score: NiveauRisqueNat_Value; //5;
        color: string; //'#68389b';
        label: NiveauRisqueNat; //'Très fort';
      };
    };
  };
  futur: {
    score: NiveauRisqueNat_Value; //1;
    color: string; //'#a0cd63';
    label: NiveauRisqueNat; //'A priori nul ou hors zonage';
  };
};

export type CatnatResponseElementAPI = {
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

export type ZonesSecheresseReponseAPI = {
  actuel: {
    type: string; //"FeatureCollection",
    features: [
      {
        type: string; //"Feature",
        geometry: {
          type: string; //"Polygon",
          coordinates: [
            [
              number[],
              // 4.974005,
              // 47.307084
            ],
          ];
        };
        properties: {
          score: NiveauRisqueNat_Value; //4,
          color: string; //"#e9352e",
          label: NiveauRisqueNat; //"Fort"
        };
      },
    ];
  };
};

@Injectable()
export class MaifAPIClient {
  constructor() {}

  public async callAPICatnatByCodeCommune(
    code_commune: string,
  ): Promise<CatnatResponseElementAPI[]> {
    const result = await this.callAPI(API_URL_CATNAT, 'maif/catnat', {
      codeInsee: code_commune,
    });
    if (!result) return null;
    return result as CatnatResponseElementAPI[];
  }

  public async callAPIZonesSecheresseByCodeCommune(
    code_commune: string,
  ): Promise<ZonesSecheresseReponseAPI> {
    const result = await this.callAPI(
      API_URL_ZONES_SECHERESSE.replace('CODE_COMMUNE', code_commune),
      'maif/zones_secheresse',
      {},
    );
    if (!result) return null;
    return result as ZonesSecheresseReponseAPI;
  }

  public async callAPISecheresseScore(
    longitude: number,
    latitude: number,
  ): Promise<SecheresseScoreResponseAPI> {
    const result = await this.callAPI(
      API_URL_SCORE_SECHERESSE,
      'maif/secheresse_score',
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI('maif/secheresse_score');
    return result as SecheresseScoreResponseAPI;
  }

  private async callAPI(
    url: string,
    name: string,
    params: object,
  ): Promise<object> {
    if (!App.getMaifAPILogin()) {
      console.log('Missing MAIF Credentials');
      return undefined;
    }
    let response;
    const call_time = Date.now();
    try {
      response = await axios.get(url, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.getBasicAuth()}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(`Error calling [${name}] after ${Date.now() - call_time} ms`);
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:${name}:${Date.now() - call_time}`);

    return response.data;
  }

  private getBasicAuth(): string {
    return Buffer.from(
      `${App.getMaifAPILogin()}:${App.getMaifAPIPassword()}`,
    ).toString('base64');
  }
}
