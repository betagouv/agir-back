import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';

export class TuileThematiqueAPI {
  @ApiProperty({ enum: Thematique }) thematique: Thematique;

  public static mapToAPI(them: Thematique): TuileThematiqueAPI {
    return {
      thematique: them,
    };
  }
}
