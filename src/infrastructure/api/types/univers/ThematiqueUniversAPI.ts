import { ApiProperty } from '@nestjs/swagger';
import { TuileMission } from '../../../../domain/thematique/tuileMission';
import { ThematiqueRepository } from '../../../repository/thematique.repository';

// FIXME : A SUPPRIMER
export class ThematiqueUniversAPI {
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() progression: number;
  @ApiProperty() cible_progression: number;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() reason_locked: string;
  @ApiProperty() is_new: boolean;
  @ApiProperty() image_url: string;
  @ApiProperty() univers_parent: string;
  @ApiProperty() univers_parent_label: string;

  public static mapToAPI(tuile: TuileMission): ThematiqueUniversAPI {
    return {
      titre: tuile.titre,
      progression: tuile.progression,
      cible_progression: tuile.cible_progression,
      type: tuile.code,
      is_locked: false,
      reason_locked: null,
      is_new: tuile.is_new,
      image_url: tuile.image_url,
      univers_parent: tuile.thematique,
      univers_parent_label: ThematiqueRepository.getLabelThematique(
        tuile.thematique,
      ),
    };
  }
}
