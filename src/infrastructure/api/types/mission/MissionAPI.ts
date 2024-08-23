import { ApiProperty } from '@nestjs/swagger';
import { Mission, Objectif } from '../../../../../src/domain/mission/mission';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';
import { DefiStatus } from '../../../../../src/domain/defis/defi';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class ObjectifAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() content_id: string;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() is_reco: boolean;
  @ApiProperty() points: number;
  @ApiProperty() done: boolean;
  @ApiProperty({ enum: DefiStatus }) defi_status: DefiStatus;
  @ApiProperty() sont_points_en_poche: boolean;
  @ApiProperty() done_at: Date;
  @ApiProperty({ enum: ContentType }) type: ContentType;

  public static mapToAPI(objectif: Objectif): ObjectifAPI {
    return {
      id: objectif.id,
      titre: objectif.titre,
      content_id: objectif.content_id,
      is_locked: objectif.is_locked,
      done: objectif.isDone(),
      done_at: objectif.done_at,
      type: objectif.type,
      points: objectif.points,
      sont_points_en_poche: objectif.sont_points_en_poche,
      is_reco: objectif.est_reco,
      defi_status: objectif.defi_status,
    };
  }
}

export class MissionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() done_at: Date;
  @ApiProperty() terminable: boolean;
  @ApiProperty() is_new: boolean;
  @ApiProperty() image_url: string;
  @ApiProperty() thematique_univers: string;
  @ApiProperty() thematique_univers_label: string;
  @ApiProperty() univers: string;
  @ApiProperty() univers_label: string;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;
  @ApiProperty({ type: ProgressionAPI }) progression_kyc: ProgressionAPI;
  @ApiProperty({ type: [ObjectifAPI] }) objectifs: ObjectifAPI[];

  public static mapToAPI(mission: Mission): MissionAPI {
    return {
      id: mission.id,
      titre: ThematiqueRepository.getTitreThematiqueUnivers(
        mission.thematique_univers,
      ),
      done_at: mission.done_at,
      objectifs: mission.objectifs.map((o) => ObjectifAPI.mapToAPI(o)),
      thematique_univers: mission.thematique_univers,
      thematique_univers_label: ThematiqueRepository.getTitreThematiqueUnivers(
        mission.thematique_univers,
      ),
      univers_label: ThematiqueRepository.getTitreUnivers(
        ThematiqueRepository.getUniversParent(mission.thematique_univers),
      ),
      univers: ThematiqueRepository.getUniversParent(
        mission.thematique_univers,
      ),
      progression: mission.getProgression(),
      is_new: mission.isNew(),
      progression_kyc: mission.getProgressionKYC(),
      image_url: ThematiqueRepository.getTuileThematique(
        mission.thematique_univers,
      ).image_url,
      terminable: mission.estTerminable(),
    };
  }
}
