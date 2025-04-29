import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../domain/app';
import { ApplicationError } from '../../../applicationError';

const API_URL_CATNAT =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/catnat';

const API_URL_ZONES_SECHERESSE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/secheresses/scores/CODE_COMMUNE/zones';

const API_URL_ZONES_INONDATION =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/inondations/scores/CODE_COMMUNE/zones';

export enum SCORE_API_NAME {
  'score_seisme' = 'score_seisme',
  'score_secheresse' = 'score_secheresse',
  'score_inondation' = 'score_inondation',
  'score_submersion' = 'score_submersion',
  'score_tempete' = 'score_tempete',
  'score_argile' = 'score_argile',
  'score_radon' = 'score_radon',
}
const NAME_URL_MAPPING: Record<SCORE_API_NAME, string> = {
  score_argile:
    'https://api.aux-alentours.dev.1934.io/v2/risques/naturels/argiles/scores',
  score_inondation:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/inondations/scores',
  score_radon:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/radon/scores',
  score_secheresse:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/secheresses/scores',
  score_seisme:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/seismes/scores',
  score_submersion:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/submersions/scores',
  score_tempete:
    'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/tempetes/scores',
};

const API_TIMEOUT = 4000;

export enum NiveauRisqueNatAPI {
  'A priori nul ou hors zonage' = 'A priori nul ou hors zonage',
  'Très faible' = 'Très faible',
  'Faible' = 'Faible',
  'Moyen' = 'Moyen',
  'Fort' = 'Fort',
  'Très fort' = 'Très fort',
}
export type NiveauRisqueNat_Value = 1 | 2 | 3 | 4 | 5;

export type RadonScoreResponseAPI = {
  potentielRadon: number; // 3,
  label: string; //"Fort (catégorie 3)",
  color: string; //"#941C34",
  numInsee: string; //"79091"
};
export type SeismeScoreResponseAPI = {
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

export type ArgileScoreResponseAPI = {
  search_parameters: {
    lat: number; //48.7,
    lon: number; //2.24
  };
  metadata: {
    data_sources: [
      {
        id: string; //"georisques",
        name: string; //"Géorisques",
        url: string; //"https://www.georisques.gouv.fr/donnees/bases-de-donnees",
        description: string; //"Géorisques est le site de référence sur les risques majeurs naturels et technologiques",
        license_name: string; //"Licence etalab-2.0",
        license_url: string; //"https://github.com/etalab/licence-ouverte/blob/master/LO.md",
        provider: {
          id: string; //"ministere-de-la-transition-ecologique",
          name: string; //"Ministère de la Transition écologique",
          url: string; //"https://www.ecologie.gouv.fr/"
        };
      },
    ];
  };
  documentation: string; //"Le retrait gonflement des sols argileux (RGA) ou sécheresse est lié aux phénomènes climatiques et aux caractéristiques des sols argileux. Lors des épisodes pluvieux intenses, l’argile se gorge d’eau et gonfle. Puis, avec la sécheresse, il se rétracte. Ce phénomène a pour conséquence de fortes contraintes mécaniques sur les constructions. Les plus vulnérables sont les maisons individuelles.",
  data: {
    score: number; //3,
    label: string; //"Fort",
    color: string; //"#f57b7f",
    zone: {
      type: string; //"Feature",
      geometry: {
        type: string; //"Polygon",
        coordinates: number[][][]; //[[[2.275343338, 48.733507041],[2.275531296,48.733236716]]]
      };
      properties: {
        score: number; //3,
        label: string; //"Fort",
        color: string; //"#f57b7f"
      };
    };
  };
};

export type GenericScoreResponseAPI = {
  actuel: {
    score: NiveauRisqueNat_Value; //5,
    color: string; //"#68389b",
    label: NiveauRisqueNatAPI; //"Très fort",
    zone: {
      type: string; //"Feature",
      geometry: {
        type: string; //"Polygon",
        coordinates: number[][][]; // [[[1.997847,48.001551],[2.000246,48.002862]]]
      };
      properties: {
        score: NiveauRisqueNat_Value; //5;
        color: string; //'#68389b';
        label: NiveauRisqueNatAPI; //'Très fort';
      };
    };
  };
  futur: {
    score: NiveauRisqueNat_Value; //1;
    color: string; //'#a0cd63';
    label: NiveauRisqueNatAPI; //'A priori nul ou hors zonage';
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

export type ZonesReponseAPI = {
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
          label: NiveauRisqueNatAPI; //"Fort"
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
  ): Promise<ZonesReponseAPI> {
    const result = await this.callAPI(
      API_URL_ZONES_SECHERESSE.replace('CODE_COMMUNE', code_commune),
      'zones_secheresse',
      {},
    );
    if (!result) return null;
    return result as ZonesReponseAPI;
  }
  public async callAPIZonesinondationByCodeCommune(
    code_commune: string,
  ): Promise<ZonesReponseAPI> {
    const result = await this.callAPI(
      API_URL_ZONES_INONDATION.replace('CODE_COMMUNE', code_commune),
      'zones_inondation',
      {},
    );
    if (!result) return null;
    return result as ZonesReponseAPI;
  }

  public async callAPISecheresseScore(
    longitude: number,
    latitude: number,
  ): Promise<GenericScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_secheresse,
      SCORE_API_NAME.score_secheresse,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_secheresse,
      );
    return result as GenericScoreResponseAPI;
  }
  public async callAPIInondationScore(
    longitude: number,
    latitude: number,
  ): Promise<GenericScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_inondation,
      SCORE_API_NAME.score_inondation,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_inondation,
      );
    return result as GenericScoreResponseAPI;
  }
  public async callAPIRadonScore(
    longitude: number,
    latitude: number,
  ): Promise<RadonScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_radon,
      SCORE_API_NAME.score_radon,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_radon,
      );
    return result as RadonScoreResponseAPI;
  }
  public async callAPISubmersionScore(
    longitude: number,
    latitude: number,
  ): Promise<GenericScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_submersion,
      SCORE_API_NAME.score_submersion,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_submersion,
      );
    return result as GenericScoreResponseAPI;
  }
  public async callAPITempeteScore(
    longitude: number,
    latitude: number,
  ): Promise<GenericScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_submersion,
      SCORE_API_NAME.score_tempete,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_tempete,
      );
    return result as GenericScoreResponseAPI;
  }
  public async callAPISeismeScore(
    longitude: number,
    latitude: number,
  ): Promise<SeismeScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_seisme,
      SCORE_API_NAME.score_seisme,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_seisme,
      );
    return result as SeismeScoreResponseAPI;
  }

  public async callAPIArgileScore(
    longitude: number,
    latitude: number,
  ): Promise<ArgileScoreResponseAPI> {
    const result = await this.callAPI(
      NAME_URL_MAPPING.score_argile,
      SCORE_API_NAME.score_argile,
      {
        lat: latitude,
        lon: longitude,
      },
    );
    if (!result)
      ApplicationError.throwErrorCallingExterneAPI(
        'maif/' + SCORE_API_NAME.score_argile,
      );
    return result as ArgileScoreResponseAPI;
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
      console.log(
        `Error calling [maif/${name}] after ${Date.now() - call_time} ms`,
      );
      if (error.response) {
        console.error(error.response);
      } else if (error.request) {
        console.error(error.request);
      }
      return null;
    }
    console.log(`API_TIME:maif/${name}:${Date.now() - call_time}`);

    return response.data;
  }

  private getBasicAuth(): string {
    return Buffer.from(
      `${App.getMaifAPILogin()}:${App.getMaifAPIPassword()}`,
    ).toString('base64');
  }
}
