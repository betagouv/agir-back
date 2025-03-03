import { ApiProperty } from '@nestjs/swagger';
import { TuileThematiqueAPI } from './TuileThematiqueAPI';
import { ThematiqueSynthese } from '../../../../domain/thematique/thematiqueSynthese';

export class SyntheseThematiquesAPI {
  @ApiProperty() nom_commune: string;
  @ApiProperty({ type: [TuileThematiqueAPI] })
  liste_thematiques: TuileThematiqueAPI[];

  public static mapToAPI(synth: {
    nom_commune: string;
    thematiques: ThematiqueSynthese[];
  }): SyntheseThematiquesAPI {
    return {
      nom_commune: synth.nom_commune,
      liste_thematiques: synth.thematiques.map((r) =>
        TuileThematiqueAPI.mapToAPI(r),
      ),
    };
  }
}
