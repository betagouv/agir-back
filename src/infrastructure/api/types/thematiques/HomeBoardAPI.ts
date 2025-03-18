import { ApiProperty } from '@nestjs/swagger';
import { HomeBoard } from '../../../../domain/thematique/homeBoard';

export class HomeBoardAPI {
  @ApiProperty() nom_commune: string;
  @ApiProperty() total_national_actions_faites: number;
  @ApiProperty() total_utilisateur_actions_faites: number;
  @ApiProperty() pourcentage_bilan_done: number;
  @ApiProperty() nombre_aides: number;
  @ApiProperty() nombre_recettes: number;

  public static mapToAPI(board: HomeBoard): HomeBoardAPI {
    return {
      nom_commune: board.nom_commune,
      total_national_actions_faites: board.total_actions_faites,
      total_utilisateur_actions_faites: board.total_utilisateur_actions_faites,
      pourcentage_bilan_done: board.pourcentage_bilan_done,
      nombre_aides: board.nombre_aides,
      nombre_recettes: board.nombre_recettes,
    };
  }
}
