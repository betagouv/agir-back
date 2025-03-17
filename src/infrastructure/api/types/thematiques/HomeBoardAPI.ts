import { ApiProperty } from '@nestjs/swagger';
import { HomeBoard } from '../../../../domain/thematique/homeBoard';

export class HomeBoardAPI {
  @ApiProperty() nom_commune: string;

  public static mapToAPI(board: HomeBoard): HomeBoardAPI {
    return {
      nom_commune: board.nom_commune,
    };
  }
}
