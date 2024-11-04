import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/contenu/thematique';
import { ThematiqueRepository } from '../../../repository/thematique.repository';
import { TuileMission } from '../../../../domain/univers/tuileMission';

export class TuileMissionAPI {
  @ApiProperty() titre: string;
  @ApiProperty() code: string;
  @ApiProperty() progression: number;
  @ApiProperty() cible_progression: number;
  @ApiProperty() is_new: boolean;
  @ApiProperty() image_url: string;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty() thematique_label: string;

  public static mapToAPI(tuileMission: TuileMission): TuileMissionAPI {
    return {
      titre: tuileMission.titre,
      progression: tuileMission.progression,
      cible_progression: tuileMission.cible_progression,
      code: tuileMission.code,
      is_new: tuileMission.is_new,
      image_url: tuileMission.image_url,
      thematique: tuileMission.thematique,
      thematique_label: ThematiqueRepository.getLibelleThematique(
        tuileMission.thematique,
      ),
    };
  }
}
