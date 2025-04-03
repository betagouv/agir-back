import { ApiProperty } from '@nestjs/swagger';
import { Badge } from '../../../../domain/gamification/badge';
import { BadgeCatalogue } from '../../../../domain/gamification/badgeCatalogue';
import { Gamification } from '../../../../domain/gamification/gamification';
import { TypeBadge } from '../../../../domain/gamification/typeBadge';

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
export class GamificationAPI {
  @ApiProperty() points: number;
  @ApiProperty({ type: [BadgeAPI] }) badges: BadgeAPI[];

  public static mapToAPI(gamif: Gamification): GamificationAPI {
    return {
      points: gamif.getPoints(),
      badges: gamif
        .getBadges()
        .map((b) => BadgeAPI.mapToApi(BadgeCatalogue.getBadge(b))),
    };
  }
}
