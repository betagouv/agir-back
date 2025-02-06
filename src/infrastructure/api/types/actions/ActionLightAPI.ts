import { ApiProperty } from '@nestjs/swagger';
import { ActionDefinition } from '../../../../domain/actions/actionDefinition';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { Thematique } from '../../../../domain/contenu/thematique';

export class ActionLightAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;

  public static mapToAPI(action: ActionDefinition): ActionLightAPI {
    return {
      nombre_actions_en_cours: Math.round(Math.random() * 1000),
      nombre_aides_disponibles: Math.round(Math.random() * 10),
      code: action.code,
      titre: action.titre,
      sous_titre: action.sous_titre,
      type: action.type,
      thematique: action.thematique,
    };
  }
}
