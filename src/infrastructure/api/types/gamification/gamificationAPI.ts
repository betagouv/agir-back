import { ApiProperty } from '@nestjs/swagger';
import { Feature } from '../../../../../src/domain/gamification/feature';
import { Badge } from '../../../../domain/gamification/badge';
import { BadgeCatalogue } from '../../../../domain/gamification/badgeCatalogue';
import {
  Celebration,
  CelebrationType,
} from '../../../../domain/gamification/celebrations/celebration';
import { Gamification } from '../../../../domain/gamification/gamification';
import { TypeBadge } from '../../../../domain/gamification/typeBadge';
import { MissionRepository } from '../../../repository/mission.repository';

export class BadgeAPI {
  @ApiProperty({ enum: TypeBadge }) type: TypeBadge;
  @ApiProperty() titre: string;
  @ApiProperty() description: string;
  @ApiProperty() image_url: string;

  static mapToApi(badge: Badge): BadgeAPI {
    return {
      type: badge.type,
      titre: badge.titre,
      description: badge.description,
      image_url: badge.image_url,
    };
  }
}
export class RevealAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: Feature }) feature: Feature;
  @ApiProperty() titre: string;
  @ApiProperty() description: string;
}
export class CelebrationAPI {
  @ApiProperty() id: string;
  @ApiProperty({ enum: CelebrationType }) type: CelebrationType;
  @ApiProperty() titre: string;
  @ApiProperty({ required: false }) new_niveau?: number;
  @ApiProperty({ required: false }) reveal?: RevealAPI;

  @ApiProperty()
  thematique_univers_label?: string;

  public static mapToAPI(celeb: Celebration): CelebrationAPI {
    return {
      id: celeb.id,
      type: celeb.type,
      titre: celeb.titre,
      new_niveau: celeb.new_niveau,
      reveal: celeb.reveal,
      thematique_univers_label: celeb.thematique_univers
        ? MissionRepository.getTitreByCode(celeb.thematique_univers)
        : undefined,
    };
  }
}
export class GamificationAPI {
  @ApiProperty() points: number;
  @ApiProperty() niveau: number;
  @ApiProperty({ type: [BadgeAPI] }) badges: BadgeAPI[];
  @ApiProperty() current_points_in_niveau: number;
  @ApiProperty() point_target_in_niveau: number;
  @ApiProperty({ type: [CelebrationAPI] }) celebrations: CelebrationAPI[];

  public static mapToAPI(gamif: Gamification): GamificationAPI {
    return {
      points: gamif.getPoints(),
      niveau: gamif.getNiveau(),
      current_points_in_niveau: gamif.getCurrent_points_in_niveau(),
      point_target_in_niveau: gamif.getPoint_target_in_niveau(),
      celebrations: gamif.celebrations
        ? gamif.celebrations.map((c) => CelebrationAPI.mapToAPI(c))
        : [],
      badges: gamif
        .getBadges()
        .map((b) => BadgeAPI.mapToApi(BadgeCatalogue.getBadge(b))),
    };
  }
}
