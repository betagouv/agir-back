import { ApiProperty } from '@nestjs/swagger';
import { TuileThematique } from '../../../../domain/univers/tuileThematique';
import { ThematiqueUnivers } from '../../../../domain/univers/thematiqueUnivers';

export class ThematiqueUniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty({ enum: ThematiqueUnivers }) type: ThematiqueUnivers;
  @ApiProperty() progression: number;
  @ApiProperty() cible_progression: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() is_new: boolean;
  @ApiProperty() niveau: number;
  @ApiProperty() image_url: string;

  public static mapToAPI(thematique: TuileThematique): ThematiqueUniversAPI {
    return {
      titre: thematique.titre,
      progression: thematique.progression,
      cible_progression: thematique.cible_progression,
      type: thematique.type,
      is_locked: thematique.is_locked,
      reason_locked: thematique.reason_locked,
      is_new: thematique.is_new,
      niveau: thematique.niveau,
      image_url: thematique.image_url,
    };
  }
}
