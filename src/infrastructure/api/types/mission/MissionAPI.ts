import { ApiProperty } from '@nestjs/swagger';
import { Mission, Objectif } from '../../../../../src/domain/mission/mission';
import { ContentType } from '../../../../../src/domain/contenu/contentType';
import { ThematiqueUnivers } from '../../../../../src/domain/univers/thematiqueUnivers';
import { Univers } from '../../../../../src/domain/univers/univers';
import { ThematiqueRepository } from '../../../../../src/infrastructure/repository/thematique.repository';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class ObjectifAPI {
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty() content_id: string;
  @ApiProperty() is_locked: boolean;
  @ApiProperty() points: number;
  @ApiProperty() done: boolean;
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
  @ApiProperty({ type: [ObjectifAPI] }) objectifs: ObjectifAPI[];

  public static mapToAPI(mission: Mission): MissionAPI {
    return {
      id: mission.id,
      titre: mission.titre,
      done_at: mission.done_at,
      objectifs: mission.objectifs.map((o) => ObjectifAPI.mapToAPI(o)),
      thematique_univers: mission.thematique_univers,
      thematique_univers_label: ThematiqueRepository.getTitreThematiqueUnivers(
        mission.thematique_univers,
      ),
      univers_label: ThematiqueRepository.getTitreUnivers(mission.univers),
      univers: mission.univers,
    };
  }
}
