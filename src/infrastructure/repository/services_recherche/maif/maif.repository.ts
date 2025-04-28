import { Injectable } from '@nestjs/common';
import { SphericalUtil } from 'node-geometry-library';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { NiveauRisqueLogement } from '../../../../domain/logement/NiveauRisque';
import { TypeRisqueLogement } from '../../../../domain/logement/TypeRisque';
import { ApplicationError } from '../../../applicationError';
import { CommuneRepository } from '../../commune/commune.repository';
import {
  MaifAPIClient,
  NiveauRisqueNat_Value,
  SCORE_API_NAME,
} from './maifAPIClient';

const mapping_score_risque_label: Record<
  NiveauRisqueNat_Value,
  NiveauRisqueLogement
> = {
  '1': NiveauRisqueLogement.tres_faible,
  '2': NiveauRisqueLogement.faible,
  '3': NiveauRisqueLogement.moyen,
  '4': NiveauRisqueLogement.fort,
  '5': NiveauRisqueLogement.tres_fort,
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
    const score_inondation = await this.maifAPIClient.callAPIInondationScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const score_submersion = await this.maifAPIClient.callAPISubmersionScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const score_tempete = await this.maifAPIClient.callAPITempeteScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const score_seisme = await this.maifAPIClient.callAPISeismeScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const score_argile = await this.maifAPIClient.callAPIArgileScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const score_radon = await this.maifAPIClient.callAPIRadonScore(
      filtre.point.longitude,
      filtre.point.latitude,
    );
    const result: ResultatRecherche[] = [];

    result.push({
      id: SCORE_API_NAME.score_secheresse,
      titre: `Risques de sécheresse`,
      niveau_risque: this.getNiveauRisqueFromScore(
        score_secheresse.actuel.score,
      ),
      type_risque: TypeRisqueLogement.secheresse,
      description: `La sécheresse géotechnique est le nom donné au phénomène de retrait-gonflement des argiles, processus naturel où les sols argileux gonflent lorsqu'ils sont humides et se rétractent lorsqu'ils sont secs, ce qui peut causer des dégradations sur les structures construites sur ces sols.`,
    });
    result.push({
      id: SCORE_API_NAME.score_inondation,
      titre: `Risques d'inondations`,
      niveau_risque: this.getNiveauRisqueFromScore(
        score_inondation.actuel.score,
      ),
      type_risque: TypeRisqueLogement.inondation,
      description: `Une inondation est une submersion ponctuelle d’origine naturelle d’une zone habituellement hors d’eau. Elle peut relever d'un phénomène régulier ou catastrophique pouvant se produire lentement ou très rapidement. Elle peut être liée à différents événements :
- la remontée des nappes phréatiques
- le ruissellement
- le débordement des cours d'eau`,
    });
    result.push({
      id: SCORE_API_NAME.score_submersion,
      titre: `Risques de submersion`,
      niveau_risque: this.getNiveauRisqueFromScore(
        score_submersion.actuel.score,
      ),
      type_risque: TypeRisqueLogement.submersion,
      description: `Les submersions marines sont des inondations rapides et de courtes durées (de quelques heures à quelques jours) de la zone côtière par la mer, lors de conditions météorologiques et océaniques défavorables.`,
    });
    result.push({
      id: SCORE_API_NAME.score_tempete,
      titre: `Risques de tempetes`,
      niveau_risque: this.getNiveauRisqueFromScore(score_tempete.actuel.score),
      type_risque: TypeRisqueLogement.tempete,
      description: ``,
    });
    result.push({
      id: SCORE_API_NAME.score_seisme,
      titre: `Risques sismiques`,
      niveau_risque: this.getNiveauRisqueFromScore(score_seisme.score),
      type_risque: TypeRisqueLogement.seisme,
      description: `Un séisme ou tremblement de terre est une rupture brutale et profonde des roches le long d'une faille (déplacement tectonique) qui provoque des vibrations plus ou moins violentes à la surface du sol.  D'autres phénomènes peuvent être à l'origine de secousses sismiques (volcan qui entre en éruption…), de mouvements des glaces ou consécutifs à l’action humaine (activités minières, barrages ou explosions).`,
    });
    result.push({
      id: SCORE_API_NAME.score_argile,
      titre: `Risques retrait/gonflement des sols argileux`,
      niveau_risque: this.getNiveauRisqueFromScore(score_argile.data.score + 1),
      type_risque: TypeRisqueLogement.argile,
      description: `La sécheresse géotechnique est le nom donné au phénomène de retrait-gonflement des argiles, processus naturel où les sols argileux gonflent lorsqu'ils sont humides et se rétractent lorsqu'ils sont secs, ce qui peut causer des dégradations sur les structures construites sur ces sols.`,
    });
    result.push({
      id: SCORE_API_NAME.score_radon,
      titre: `Risques d'exposition au radon`,
      niveau_risque: this.getNiveauRisqueFromScore(
        score_radon.potentielRadon + 1,
      ),
      type_risque: TypeRisqueLogement.radon,
      description: ``,
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

  private getNiveauRisqueFromScore(
    score: string | number,
  ): NiveauRisqueLogement {
    if (parseInt('' + score) < 1) {
      return NiveauRisqueLogement.tres_faible;
    }
    if (parseInt('' + score) > 5) {
      return NiveauRisqueLogement.tres_fort;
    }
    const value = mapping_score_risque_label['' + score];

    return value ? value : NiveauRisqueLogement.inconnu;
  }
}
