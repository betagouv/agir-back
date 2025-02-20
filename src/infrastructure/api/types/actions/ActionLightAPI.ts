import { ApiProperty } from '@nestjs/swagger';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Action } from '../../../../domain/actions/action';

export class ActionLightAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;

  public static mapToAPI(action: Action): ActionLightAPI {
    return {
      nombre_actions_en_cours: Math.round(Math.random() * 1000),
      nombre_aides_disponibles: action.nombre_aides,
      code: action.code,
      titre: action.titre,
      sous_titre: action.sous_titre,
      type: action.type,
      thematique: action.thematique,
    };
  }
}
