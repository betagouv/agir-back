import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import { ThematiqueUnivers } from '../../../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../../../src/domain/univers/univers';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class ObjectifAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() content_id: string;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() done: boolean;
  @ApiProperty() done_at: Date;
  @ApiProperty({ enum: ContentType }) type: ContentType;

  public static mapToAPI(objectif: any): ObjectifAPI {
    return {
      id: objectif.content_id,
      titre: objectif.content_id,
      content_id: objectif.content_id,
      progression: objectif.progression,
      is_locked: objectif.is_locked,
      done: objectif.done,
      done_at: objectif.done_at,
      type: objectif.type,
    };
  }
}

export class MissionAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() done_at: Date;
  @ApiProperty() thematique_univers: ThematiqueUnivers;
  @ApiProperty() thematique_univers_label: string;
  @ApiProperty() univers: Univers;
  @ApiProperty() univers_label: string;
  @ApiProperty() objectifs: ObjectifAPI[];

  public static mapToAPI(mission: any): MissionAPI {
    return {
      id: mission.id,
      titre: mission.titre,
      done_at: mission.mission,
      objectifs: undefined, //mission.objectifs.map((o) => ObjectifAPI.mapToAPI(o)),
      thematique_univers: mission.univers_parent,
      thematique_univers_label: mission.univers_parent_label,
      univers: mission.univers_parent,
      univers_label: mission.univers_parent_label,
    };
  }
}
