import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';
import { ThematiqueSynthese } from '../../../../domain/contenu/thematiqueSynthese';

export class TuileThematiqueAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() nombre_recettes: number;
  @ApiProperty() nombre_actions: number;
  @ApiProperty() nombre_aides: number;
  @ApiProperty() nombre_simulateurs: number;

  public static mapToAPI(synth: ThematiqueSynthese): TuileThematiqueAPI {
    return {
      thematique: synth.thematique,
      nombre_actions: synth.nombre_actions,
      nombre_aides: synth.nombre_aides,
      nombre_recettes: synth.nombre_recettes,
      nombre_simulateurs: synth.nombre_simulateurs,
    };
  }
}
