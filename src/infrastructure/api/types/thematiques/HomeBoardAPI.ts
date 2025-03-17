import { ApiProperty } from '@nestjs/swagger';
import { HomeBoard } from '../../../../domain/thematique/homeBoard';

export class HomeBoardAPI {
  @ApiProperty() nom_commune: string;
  @ApiProperty() total_national_actions_faites: number;

  public static mapToAPI(board: HomeBoard): HomeBoardAPI {
    return {
      nom_commune: board.nom_commune,
      total_national_actions_faites: board.total_actions_faites,
    };
  }
}
