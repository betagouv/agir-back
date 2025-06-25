import { ApiProperty } from '@nestjs/swagger';
import { HomeBoard } from '../../../../domain/thematique/homeBoard';

export class HomeBoardAPI {
  @ApiProperty() nom_commune: string;
  @ApiProperty() total_national_actions_faites: number;
  @ApiProperty() total_utilisateur_actions_faites: number;
  @ApiProperty() pourcentage_bilan_done: number;
  @ApiProperty() bilan_carbone_total_kg: number;
  @ApiProperty() nombre_aides: number;
  @ApiProperty() nombre_recettes: number;
  @ApiProperty() pourcentage_alimentation_reco_done: number;
  @ApiProperty() pourcentage_transport_reco_done: number;
  @ApiProperty() pourcentage_consommation_reco_done: number;
  @ApiProperty() pourcentage_logement_reco_done: number;
  @ApiProperty() pourcentage_global_reco_done: number;
  @ApiProperty() est_utilisateur_ngc: boolean;

  public static mapToAPI(board: HomeBoard): HomeBoardAPI {
    return {
      nom_commune: board.nom_commune,
      total_national_actions_faites: board.total_actions_faites,
      total_utilisateur_actions_faites: board.total_utilisateur_actions_faites,
      pourcentage_bilan_done: board.pourcentage_bilan_done,
      nombre_aides: board.nombre_aides,
      nombre_recettes: board.nombre_recettes,
      bilan_carbone_total_kg: board.bilan_carbone_total_kg,
      pourcentage_alimentation_reco_done:
        board.pourcentage_alimentation_reco_done,
      pourcentage_consommation_reco_done:
        board.pourcentage_consommation_reco_done,
      pourcentage_logement_reco_done: board.pourcentage_logement_reco_done,
      pourcentage_transport_reco_done: board.pourcentage_transport_reco_done,
      pourcentage_global_reco_done: board.pourcentage_global_reco_done,
      est_utilisateur_ngc: board.est_utilisateur_ngc,
    };
  }
}
