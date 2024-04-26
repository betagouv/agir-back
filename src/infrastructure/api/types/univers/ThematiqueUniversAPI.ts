import { ApiProperty } from '@nestjs/swagger';
import { ThematiqueUnivers } from '../../../../../src/domain/univers/thematiqueUnivers';
import { ThematiqueUniversType } from '../../../../../src/domain/univers/thematiqueUniversType';

export class ThematiqueUniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty({ enum: ThematiqueUniversType }) type: ThematiqueUniversType;
  @ApiProperty() progression: number;
  @ApiProperty() cible_progression: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() is_new: boolean;
  @ApiProperty() niveau: number;

  public static mapToAPI(thematique: ThematiqueUnivers): ThematiqueUniversAPI {
    return {
      titre: thematique.titre,
      progression: thematique.progression,
      cible_progression: thematique.cible_progression,
      type: thematique.type,
      is_locked: thematique.is_locked,
      reason_locked: thematique.reason_locked,
      is_new: thematique.is_new,
      niveau: thematique.niveau,
    };
  }
}
