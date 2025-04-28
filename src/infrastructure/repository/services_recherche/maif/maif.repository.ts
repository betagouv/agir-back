import { Injectable } from '@nestjs/common';
import { SphericalUtil } from 'node-geometry-library';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ApplicationError } from '../../../applicationError';
import { CommuneRepository } from '../../commune/commune.repository';
import {
  MaifAPIClient,
  NiveauRisqueNat,
  NiveauRisqueNat_Value,
} from './maifAPIClient';

const mapping_score_risque_label: Record<
  NiveauRisqueNat_Value,
  NiveauRisqueNat
> = {
  '1': NiveauRisqueNat['Très faible'],
  '2': NiveauRisqueNat.Faible,
  '3': NiveauRisqueNat.Moyen,
  '4': NiveauRisqueNat.Fort,
  '5': NiveauRisqueNat['Très fort'],
};

@Injectable()
export class MaifRepository implements FinderInterface {
  constructor(
    private commune_repo: CommuneRepository,
    private maifAPIClient: MaifAPIClient,
  ) {}

  static API_TIMEOUT = 4000;

  public getMaxResultOfCategorie(cat: CategorieRecherche): number {
    return 999999999;
  }

  public getManagedCategories(): CategorieRecherche[] {
    return [
      CategorieRecherche.catnat,
      CategorieRecherche.zones_secheresse,
      CategorieRecherche.score_risque,
    ];
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
    if (filtre.categorie === CategorieRecherche.score_risque) {
      if (!filtre.hasPoint()) ApplicationError.throwMissingLogitudeLatitude();
      return this.findScoreRisque(filtre);
    }
  }

  private async findCatnat(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const result = await this.maifAPIClient.callAPICatnatByCodeCommune(
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

  private async findScoreRisque(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const score_secheresse = await this.maifAPIClient.callAPISecheresseScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const result: ResultatRecherche[] = [];

    result.push({
      id: 'score_secheresse',
      titre: `Score de risque à la sécheresse`,
      niveau_risque: score_secheresse.actuel.score,
      niveau_risque_label: this.getLabelNiveauRisqueFromScore(
        score_secheresse.actuel.score,
      ),
    });

    return result;
  }

  private async findZonesSecheresse(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    const result = await this.maifAPIClient.callAPIZonesSecheresseByCodeCommune(
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

  private getLabelNiveauRisqueFromScore(score: string | number): string {
    const value = mapping_score_risque_label['' + score];
    return value ? value : 'inconnu';
  }
}
