import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../../../../domain/actions/action';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { Thematique } from '../../../../domain/thematique/thematique';

export class ActionLightAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() points: number;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_actions_faites: number;
  @ApiProperty() deja_vue: boolean;
  @ApiProperty() deja_faite: boolean;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;

  public static mapToAPI(action: Action): ActionLightAPI {
    return {
      nombre_actions_en_cours: action.nombre_actions_faites,
      nombre_actions_faites: action.nombre_actions_faites,
      nombre_aides_disponibles: action.nombre_aides,
      code: action.code,
      titre: action.titre,
      sous_titre: action.sous_titre,
      type: action.type,
      thematique: action.thematique,
      deja_vue: action.deja_vue,
      deja_faite: action.deja_faite,
      points: action.getNombrePoints(),
    };
  }
}
