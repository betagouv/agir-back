import { ApiProperty } from '@nestjs/swagger';
import { TuileThematique } from '../../../../domain/univers/tuileThematique';
import { TuileMission } from '../../../../domain/univers/tuileMission';
import { ThematiqueRepository } from '../../../repository/thematique.repository';

export class ThematiqueUniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() progression: number;
  @ApiProperty() cible_progression: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() is_new: boolean;
  @ApiProperty() niveau: number;
  @ApiProperty() image_url: string;
  @ApiProperty() univers_parent: string;
  @ApiProperty() univers_parent_label: string;

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
      univers_parent: thematique.univers_parent,
      univers_parent_label: thematique.univers_parent_label,
    };
  }
  public static mapToAPI_2(tuile: TuileMission): ThematiqueUniversAPI {
    return {
      titre: tuile.titre,
      progression: tuile.progression,
      cible_progression: tuile.cible_progression,
      type: tuile.code,
      is_locked: false,
      reason_locked: null,
      is_new: tuile.is_new,
      niveau: 1,
      image_url: tuile.image_url,
      univers_parent: tuile.thematique,
      univers_parent_label: ThematiqueRepository.getTitreUnivers(
        tuile.thematique,
      ),
    };
  }
}
