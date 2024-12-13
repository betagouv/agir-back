import { ApiProperty } from '@nestjs/swagger';
import { Mission, Objectif } from '../../../../../src/domain/mission/mission';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import { DefiStatus } from '../../../../../src/domain/defis/defi';
import { Thematique } from '../../../../domain/contenu/thematique';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class ObjectifAPI_v2 {
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

  public static mapToAPI(objectif: Objectif): ObjectifAPI_v2 {
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

export class MissionAPI_v2 {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() introduction: string;
  @ApiProperty() done_at: Date;
  @ApiProperty() terminable: boolean;
  @ApiProperty() is_new: boolean;
  @ApiProperty() is_examen: boolean;
  @ApiProperty() image_url: string;
  @ApiProperty() code: string;
  @ApiProperty() quizz_global_score: number;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;
  @ApiProperty({ type: ProgressionAPI }) progression_kyc: ProgressionAPI;
  @ApiProperty({ type: [ObjectifAPI_v2] }) objectifs: ObjectifAPI_v2[];

  public static mapToAPI(mission: Mission): MissionAPI_v2 {
    return {
      id: mission.id_cms,
      is_examen: mission.est_examen,
      titre: mission.titre,
      introduction: mission.introduction,
      done_at: mission.done_at,
      objectifs: mission.objectifs.map((o) => ObjectifAPI_v2.mapToAPI(o)),
      code: mission.code,
      thematique: mission.thematique,
      progression: mission.getProgression(),
      is_new: mission.isNew(),
      progression_kyc: mission.getProgressionKYC(),
      image_url: mission.image_url,
      terminable: mission.estTerminable(),
      quizz_global_score: mission.quizz_global_score,
    };
  }
}
