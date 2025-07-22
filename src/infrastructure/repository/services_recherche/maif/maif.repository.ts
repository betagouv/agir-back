import { Injectable } from '@nestjs/common';
import { FiltreRecherche } from '../../../../domain/bibliotheque_services/recherche/filtreRecherche';
import { ScoreRisquesAdresse } from '../../../../domain/logement/logement';
import { NiveauRisqueLogement } from '../../../../domain/logement/NiveauRisque';
import { ApplicationError } from '../../../applicationError';
import { CommuneRepository } from '../../commune/commune.repository';
import { MaifAPIClient, NiveauRisqueNat_Value } from './maifAPIClient';

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
export class MaifRepository {
  constructor(
    private commune_repo: CommuneRepository,
    private maifAPIClient: MaifAPIClient,
  ) {}

  static API_TIMEOUT = 4000;

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
