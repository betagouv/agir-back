import { Injectable } from '@nestjs/common';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { FinderInterface } from '../../../../domain/bibliotheque_services/recherche/finderInterface';
import { ResultatRecherche } from '../../../../domain/bibliotheque_services/recherche/resultatRecherche';
import { ScoreRisquesAdresse } from '../../../../domain/logement/logement';
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
    return [CategorieRecherche.score_risque];
  }

  public async find(filtre: FiltreRecherche): Promise<ResultatRecherche[]> {
    if (filtre.categorie === CategorieRecherche.score_risque) {
      if (!filtre.hasPoint()) ApplicationError.throwMissingLogitudeLatitude();
      return this.findScoreRisque(filtre);
    }
  }

  public async findRisqueCommuneSynthese(filtre: FiltreRecherche): Promise<{
    catnat: number;
    pourcent_secheresse: number;
    pourcent_inondation: number;
  }> {
    const code_commmune_globale = this.getCommuneGlobale(filtre.code_commune);
    if (!code_commmune_globale) {
      if (filtre.silent_error) {
        return undefined;
      } else {
        ApplicationError.throwCodeCommuneNotFound(filtre.code_commune);
      }
    }
    const result = await this.maifAPIClient.callAPISyntheseCommune(
      code_commmune_globale,
    );
    if (!result) {
      if (filtre.silent_error) {
        return undefined;
      } else {
        ApplicationError.throwExternalServiceError(
          'Alentours / synthese commune',
        );
      }
    }

    let pourcent_inondation = 0;
    for (const element of result.naturels.inondations.scores.actuel) {
      pourcent_inondation += element.percentage;
    }
    let pourcent_secheresse = 0;
    for (const element of result.naturels.argiles) {
      pourcent_secheresse += element.percentage;
    }

    return {
      catnat: result.naturels.catnat.total,
      pourcent_inondation: pourcent_inondation,
      pourcent_secheresse: pourcent_secheresse,
    };
  }

  public async findScoreRisque(
    filtre: FiltreRecherche,
  ): Promise<ResultatRecherche[]> {
    try {
      const [
        score_secheresse,
        score_inondation,
        score_submersion,
        score_tempete,
        score_seisme,
        score_argile,
        score_radon,
      ] = await Promise.all([
        this.maifAPIClient.callAPISecheresseScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        this.maifAPIClient.callAPIInondationScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        this.maifAPIClient.callAPISubmersionScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        this.maifAPIClient.callAPITempeteScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        await this.maifAPIClient.callAPISeismeScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        this.maifAPIClient.callAPIArgileScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
        this.maifAPIClient.callAPIRadonScore(
          filtre.point.longitude,
          filtre.point.latitude,
        ),
      ]);

      const result: ResultatRecherche[] = [];

      result.push({
        id: SCORE_API_NAME.score_secheresse,
        titre: `Risques de sécheresse`,
        niveau_risque: this.getNiveauRisqueFromScore(
          score_secheresse?.actuel?.score,
        ),
        type_risque: TypeRisqueLogement.secheresse,
        description: `La sécheresse géotechnique est le nom donné au phénomène de retrait-gonflement des argiles, processus naturel où les sols argileux gonflent lorsqu'ils sont humides et se rétractent lorsqu'ils sont secs, ce qui peut causer des dégradations sur les structures construites sur ces sols.`,
      });
      result.push({
        id: SCORE_API_NAME.score_inondation,
        titre: `Risques d'inondations`,
        niveau_risque: this.getNiveauRisqueFromScore(
          score_inondation?.actuel?.score,
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
          score_submersion?.actuel?.score,
        ),
        type_risque: TypeRisqueLogement.submersion,
        description: `Les submersions marines sont des inondations rapides et de courtes durées (de quelques heures à quelques jours) de la zone côtière par la mer, lors de conditions météorologiques et océaniques défavorables.`,
      });
      result.push({
        id: SCORE_API_NAME.score_tempete,
        titre: `Risques de tempêtes`,
        niveau_risque: this.getNiveauRisqueFromScore(
          score_tempete?.actuel?.score,
        ),
        type_risque: TypeRisqueLogement.tempete,
        description: ``,
      });
      result.push({
        id: SCORE_API_NAME.score_seisme,
        titre: `Risques sismiques`,
        niveau_risque: this.getNiveauRisqueFromScore(score_seisme?.score),
        type_risque: TypeRisqueLogement.seisme,
        description: `Un séisme ou tremblement de terre est une rupture brutale et profonde des roches le long d'une faille (déplacement tectonique) qui provoque des vibrations plus ou moins violentes à la surface du sol.  D'autres phénomènes peuvent être à l'origine de secousses sismiques (volcan qui entre en éruption…), de mouvements des glaces ou consécutifs à l’action humaine (activités minières, barrages ou explosions).`,
      });

      let score_argile_value = score_argile?.data?.score;
      if (score_argile_value != undefined) {
        score_argile_value++;
      }
      result.push({
        id: SCORE_API_NAME.score_argile,
        titre: `Risques retrait-gonflement des sols argileux`,
        niveau_risque: this.getNiveauRisqueFromScore(score_argile_value),
        type_risque: TypeRisqueLogement.argile,
        description: `La sécheresse géotechnique est le nom donné au phénomène de retrait-gonflement des argiles, processus naturel où les sols argileux gonflent lorsqu'ils sont humides et se rétractent lorsqu'ils sont secs, ce qui peut causer des dégradations sur les structures construites sur ces sols.`,
      });

      let score_radon_value = score_radon?.potentielRadon;
      if (score_radon_value != undefined) {
        score_radon_value++;
      }
      result.push({
        id: SCORE_API_NAME.score_radon,
        titre: `Risques d'exposition au radon`,
        niveau_risque: this.getNiveauRisqueFromScore(score_radon_value),
        type_risque: TypeRisqueLogement.radon,
        description: ``,
      });

      return result;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  public async findScoreRisque_2(
    longitude: number,
    latitude: number,
  ): Promise<ScoreRisquesAdresse> {
    const [
      score_secheresse,
      score_inondation,
      score_submersion,
      score_tempete,
      score_seisme,
      score_argile,
      score_radon,
    ] = await Promise.all([
      this.maifAPIClient.callAPISecheresseScore(longitude, latitude),
      this.maifAPIClient.callAPIInondationScore(longitude, latitude),
      this.maifAPIClient.callAPISubmersionScore(longitude, latitude),
      this.maifAPIClient.callAPITempeteScore(longitude, latitude),
      this.maifAPIClient.callAPISeismeScore(longitude, latitude),
      this.maifAPIClient.callAPIArgileScore(longitude, latitude),
      this.maifAPIClient.callAPIRadonScore(longitude, latitude),
    ]);

    const result: ScoreRisquesAdresse = new ScoreRisquesAdresse({
      argile: undefined,
      inondation: undefined,
      radon: undefined,
      secheresse: undefined,
      seisme: undefined,
      submersion: undefined,
      tempete: undefined,
    });

    if (score_secheresse) {
      result.secheresse = this.getNiveauRisqueFromScore(
        score_secheresse?.actuel?.score,
      );
    }
    if (score_inondation) {
      result.inondation = this.getNiveauRisqueFromScore(
        score_inondation?.actuel?.score,
      );
    }
    if (score_submersion) {
      result.submersion = this.getNiveauRisqueFromScore(
        score_submersion?.actuel?.score,
      );
    }
    if (score_tempete) {
      result.tempete = this.getNiveauRisqueFromScore(
        score_tempete?.actuel?.score,
      );
    }
    if (score_seisme) {
      result.seisme = this.getNiveauRisqueFromScore(score_seisme?.score);
    }

    let score_argile_value = score_argile?.data?.score;
    if (score_argile_value != undefined) {
      score_argile_value++;
    }
    if (score_argile_value) {
      result.argile = this.getNiveauRisqueFromScore(score_argile_value);
    }

    let score_radon_value = score_radon?.potentielRadon;
    if (score_radon_value != undefined) {
      score_radon_value++;
    }
    if (score_radon_value) {
      result.radon = this.getNiveauRisqueFromScore(score_radon_value);
    }

    return result;
  }

  private getCommuneGlobale(code_commune: string): string {
    const commune = this.commune_repo.getCommuneByCodeINSEE(code_commune);
    return commune.commune ? commune.commune : code_commune;
  }

  private getNiveauRisqueFromScore(
    score: string | number,
  ): NiveauRisqueLogement {
    if (score === undefined) {
      return NiveauRisqueLogement.inconnu;
    }
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
