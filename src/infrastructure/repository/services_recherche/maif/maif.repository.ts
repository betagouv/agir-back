import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SphericalUtil } from 'node-geometry-library';
import { App } from '../../../../domain/app';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../../applicationError';
import { CommuneRepository } from '../../commune/commune.repository';

const API_URL_CATNAT =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/catnat';

const API_URL_ZONES_SECHERESSE =
  'https://api.aux-alentours.dev.1934.io/v1/risques/naturels/secheresses/scores/CODE_COMMUNE/zones';

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

export type ZonesSecheresseReponse = {
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
          score: number; //4,
          color: string; //"#e9352e",
          label: string; //"Fort"
        };
      },
    ];
  };
};

@Injectable()
export class MaifRepository implements FinderInterface {
  constructor(private commune_repo: CommuneRepository) {}

  static API_TIMEOUT = 4000;

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [CategorieRecherche.catnat, CategorieRecherche.zones_secheresse];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    if (filtre.categorie === CategorieRecherche.catnat) {
      if (!filtre.code_commune) return [];
      return this.findCatnat(filtre);
    }
    if (filtre.categorie === CategorieRecherche.zones_secheresse) {
      if (!filtre.code_commune) return [];
      return this.findZonesSecheresse(filtre);
    }
  }

  private async findCatnat(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const result = await this.searchCatnatByCodeCommune(
      this.getCommuneGlobale(filtre.code_commune),
    );
    if (!result) {
      if (filtre.silent_error) {
        return [];
      } else {
        ApplicationError.throwExternalServiceError('Alentours / Catnat');
      }
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

  private async findZonesSecheresse(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const result = await this.searchZonesSecheresseByCodeCommune(
      this.getCommuneGlobale(filtre.code_commune),
    );
    if (!result) {
      if (filtre.silent_error) {
        return [];
      } else {
        ApplicationError.throwExternalServiceError(
          'Alentours / Secheresse zones',
        );
      }
    }
    let synthese = {
      zone_1: 0,
      zone_2: 0,
      zone_3: 0,
      zone_4: 0,
      zone_5: 0,
    };

    for (const feature of result.actuel.features) {
      const area = this.computeAreaOfClosedPath(
        feature.geometry.coordinates[0],
      );
      synthese[`zone_${feature.properties.score}`] =
        synthese[`zone_${feature.properties.score}`] + area;
    }
    const total_area =
      synthese.zone_1 +
      synthese.zone_2 +
      synthese.zone_3 +
      synthese.zone_4 +
      synthese.zone_5;

    return [
      {
        id: 'zone_1',
        titre: 'Pourcentage risque très faible',
        pourcentage: Math.round((synthese.zone_1 / total_area) * 100),
      },
      {
        id: 'zone_2',
        titre: 'Pourcentage risque faible',
        pourcentage: Math.round((synthese.zone_2 / total_area) * 100),
      },
      {
        id: 'zone_3',
        titre: 'Pourcentage risque moyen',
        pourcentage: Math.round((synthese.zone_3 / total_area) * 100),
      },
      {
        id: 'zone_4',
        titre: 'Pourcentage risque fort',
        pourcentage: Math.round((synthese.zone_4 / total_area) * 100),
      },
      {
        id: 'zone_5',
        titre: 'Pourcentage risque très fort',
        pourcentage: Math.round((synthese.zone_5 / total_area) * 100),
      },
      {
        id: 'total',
        titre: 'Total considéré à risque',
        pourcentage: Math.round(
          ((synthese.zone_5 + synthese.zone_4) / total_area) * 100,
        ),
      },
    ];
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

  private async searchZonesSecheresseByCodeCommune(
    code_commune: string,
  ): Promise<ZonesSecheresseReponse> {
    if (!App.getMaifAPILogin()) {
      console.log('Missing MAIF Credentials');
      return undefined;
    }
    let response;
    const call_time = Date.now();

    const BASIC = Buffer.from(
      `${App.getMaifAPILogin()}:${App.getMaifAPIPassword()}`,
    ).toString('base64');
    try {
      response = await axios.get(
        API_URL_ZONES_SECHERESSE.replace('CODE_COMMUNE', code_commune),
        {
          timeout: MaifRepository.API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${BASIC}`,
          },
        },
      );
    } catch (error) {
      console.log(
        `Error calling [maif/zones_secheresse] after ${
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
    console.log(`API_TIME:maif/zones_secheresse:${Date.now() - call_time}`);

    return response.data;
  }

  private computeAreaOfClosedPath(path: number[][]): number {
    const converted_format = path.map((point) => ({
      lat: point[1],
      lng: point[0],
    }));

    return SphericalUtil.computeArea(converted_format);
  }

  private getCommuneGlobale(code_commune: string): string {
    const commune = this.commune_repo.getCommuneByCodeINSEE(code_commune);
    return commune.commune ? commune.commune : code_commune;
  }
}
